import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";
import { validateFileUpload, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES, MAX_FILE_SIZE } from "@/lib/security";
import { validateSlug } from "@/lib/security";
import { commitToGitHub } from "@/app/api/admin/github-commit/route";

const ARTIST_MEDIA_ROOT = path.join(process.cwd(), "public", "artists");

async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const artistSlug = (form.get("artistSlug") as string | null)?.trim();
    const brand = (form.get("brand") as string | null)?.trim() || "";
    const projectTitle = (form.get("projectTitle") as string | null)?.trim() || "";
    const typeRaw = (form.get("type") as string | null)?.trim().toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate artist slug
    if (!artistSlug) {
      return NextResponse.json({ error: "artistSlug is required" }, { status: 400 });
    }
    const slugValidation = validateSlug(artistSlug);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const sanitizedSlug = slugValidation.sanitized!;

    // Validate type
    const type = typeRaw === "video" ? "video" : "photo";
    
    // Validate file upload
    // For video type, we allow both image (thumbnail) and video files
    // For photo type, we only allow image files
    let allowedExtensions: string[];
    let allowedMimes: string[];
    
    if (type === "video") {
      // Video type can accept both images (for thumbnails) and videos
      allowedExtensions = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS];
      allowedMimes = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
    } else {
      // Photo type only accepts images
      allowedExtensions = ALLOWED_IMAGE_EXTENSIONS;
      allowedMimes = ALLOWED_IMAGE_MIMES;
    }
    
    const fileValidation = validateFileUpload(file, allowedExtensions, allowedMimes, MAX_FILE_SIZE);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Check if we're on Vercel and have Blob Storage token
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    
    // Determine file extension from original filename or mime
    const originalName = (file as any).name || "upload";
    let ext = path.extname(originalName);
    if (!ext) {
      // Fallback extension by type
      ext = type === "video" ? ".mp4" : ".jpg";
    }

    // Build filename: brand__project__type.ext if brand/project provided, else timestamp name
    const safe = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const baseName =
      brand && projectTitle
        ? `${safe(brand)}__${safe(projectTitle)}__${type}`
        : `upload-${Date.now()}`;

    const fileName = `${baseName}${ext.toLowerCase()}`;
    let publicUrl: string;

    // Use Vercel Blob Storage if available, otherwise use file system
    if (isVercel && hasBlobToken) {
      // Upload to Vercel Blob Storage
      try {
        const blobPath = `artists/${sanitizedSlug}/${fileName}`;
        const blob = await put(blobPath, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        publicUrl = blob.url;
      } catch (blobError: any) {
        console.error("Error uploading to Blob Storage:", blobError);
        return NextResponse.json(
          { 
            error: `Vercel Blob Storage'a yükleme başarısız: ${blobError.message}`,
          },
          { status: 500 }
        );
      }
    } else if (isVercel && !hasBlobToken) {
      // On Vercel but no Blob Storage token - inform user to upload locally
      return NextResponse.json(
        { 
          error: "Vercel'de file upload yapılamaz. Lütfen dosyaları local'de yükleyin ve GitHub'a push edin. Local'de: npm run dev ile siteyi başlatın, admin panelden upload yapın, dosyaları GitHub'a commit edip push edin.",
        },
        { status: 503 }
      );
    } else {
      // Local development: use file system
      const artistDir = path.join(ARTIST_MEDIA_ROOT, sanitizedSlug);
      
      try {
        if (!fs.existsSync(artistDir)) {
          fs.mkdirSync(artistDir, { recursive: true });
        }
      } catch (dirError: any) {
        console.error("Error creating directory:", dirError);
        return NextResponse.json(
          { 
            error: `Klasör oluşturulamadı: ${dirError.message}`,
          },
          { status: 500 }
        );
      }

      const targetPath = path.join(artistDir, fileName);

      // Write file to local file system
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(targetPath, buffer);
      } catch (writeError: any) {
        console.error("Error writing file:", writeError);
        return NextResponse.json(
          { 
            error: `Dosya yazılamadı: ${writeError.message}`,
          },
          { status: 500 }
        );
      }

      publicUrl = `/artists/${sanitizedSlug}/${fileName}`;
    }

    // On Vercel, also save work info to metadata
    if (isVercel && hasBlobToken) {
      try {
        // Load current metadata
        const githubToken = process.env.GITHUB_TOKEN;
        const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
        const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
        const branch = "main";
        const metadataPath = "data/artists-metadata.json";

        // Fetch current metadata from GitHub
        const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${metadataPath}?ref=${branch}`;
        const getFileRes = await fetch(getFileUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
          cache: "no-store",
        });

        let metadata: Record<string, any> = {};
        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          const content = Buffer.from(fileData.content, "base64").toString("utf-8");
          metadata = JSON.parse(content);
        }

        // Initialize artist metadata if not exists
        if (!metadata[sanitizedSlug]) {
          metadata[sanitizedSlug] = {};
        }
        if (!metadata[sanitizedSlug].portfolio) {
          metadata[sanitizedSlug].portfolio = {};
        }

        // Create work ID from filename
        const workId = `${sanitizedSlug}-${fileName.replace(/\.[^/.]+$/, "")}`;
        
        // Parse brand and project from filename if available
        const formatLabel = (raw: string): string => {
          if (!raw) return "";
          return raw
            .split(/[-_]+/)
            .filter(Boolean)
            .map((segment) => {
              const upper = segment.toUpperCase();
              if (segment.length <= 3 || /^[A-Z0-9]+$/.test(segment)) {
                return upper;
              }
              return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
            })
            .join(" ");
        };

        const parts = fileName.replace(/\.[^/.]+$/, "").split("__");
        let brandFormatted = "";
        let projectTitleFormatted = "";
        if (parts.length >= 2) {
          brandFormatted = formatLabel(parts[0]);
          projectTitleFormatted = formatLabel(parts[1]);
        } else {
          brandFormatted = formatLabel(sanitizedSlug);
          projectTitleFormatted = formatLabel(fileName.replace(/\.[^/.]+$/, ""));
        }

        // Add work to metadata
        metadata[sanitizedSlug].portfolio[workId] = {
          url: publicUrl,
          alt: `${brandFormatted} ${projectTitleFormatted}`.trim(),
          type: type,
          projectTitle: projectTitleFormatted || brandFormatted,
          brand: brandFormatted || formatLabel(sanitizedSlug),
          fileName: fileName,
        };

        // Commit to GitHub
        await commitToGitHub({
          filePath: metadataPath,
          message: `Add work: ${fileName} for ${sanitizedSlug}`,
          content: JSON.stringify(metadata, null, 2),
        });
      } catch (metaError: any) {
        console.error("Error saving work to metadata:", metaError);
        // Don't fail the upload if metadata save fails
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Dosya yüklendi",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    const isProduction = process.env.NODE_ENV === "production";
    
    // Provide more detailed error messages in development
    let errorMessage = "Yükleme sırasında hata oluştu";
    if (!isProduction) {
      errorMessage = error.message || error.toString() || "Yükleme sırasında hata oluştu";
      // Log stack trace in development
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let imagePath = searchParams.get("path");
    const workId = searchParams.get("workId");
    const artistSlug = searchParams.get("artistSlug");

    if (!imagePath) {
      return NextResponse.json({ error: "Image path is required" }, { status: 400 });
    }

    // Decode URL encoding
    imagePath = decodeURIComponent(imagePath);

    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // Check if it's a blob storage URL
    const isBlobStorageUrl = imagePath.startsWith("https://") && (
      imagePath.includes(".public.blob.vercel-storage.com") ||
      imagePath.includes("blob.vercel-storage.com")
    );

    // Check if it's an external URL (not blob storage)
    if (imagePath.startsWith("http://") || (imagePath.startsWith("https://") && !isBlobStorageUrl)) {
      return NextResponse.json(
        { error: "Harici URL'lerden gelen görseller silinemez. Sadece yüklenmiş görseller silinebilir." },
        { status: 400 }
      );
    }

    // Delete from blob storage if it's a blob storage URL
    if (isBlobStorageUrl && hasBlobToken) {
      try {
        await del(imagePath, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log("File deleted from blob storage:", imagePath);
      } catch (blobError: any) {
        console.error("Error deleting from blob storage:", blobError);
        // Continue to metadata deletion even if blob deletion fails
      }
    } else if (!isBlobStorageUrl) {
      // Delete from local file system
      // Remove leading slash if present and normalize path separators
      let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
      // Normalize path separators (handle both / and \) - Windows compatibility
      cleanPath = cleanPath.replace(/\\/g, "/");
      
      // Security: Ensure the path is within the artists or submissions directory
      const normalizedCleanPath = cleanPath.toLowerCase();
      if (!normalizedCleanPath.startsWith("artists/") && !normalizedCleanPath.startsWith("submissions/")) {
        return NextResponse.json({ error: "Invalid path. Path must be within artists or submissions directory." }, { status: 400 });
      }

      // Build the full path
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      const normalizedPath = path.resolve(fullPath);
      
      // Check if file exists
      if (fs.existsSync(normalizedPath)) {
        const stat = fs.statSync(normalizedPath);
        if (stat.isFile()) {
          try {
            fs.unlinkSync(normalizedPath);
            console.log("File deleted from local file system:", normalizedPath);
          } catch (unlinkError: any) {
            console.error("Error unlinking file:", unlinkError);
            // Continue to metadata deletion even if file deletion fails
          }
        }
      }
    }

    // Delete from metadata if workId and artistSlug are provided
    if (workId && artistSlug) {
      try {
        // Load metadata
        let metadata: Record<string, any> = {};
        
        if (isVercel) {
          // On Vercel, read from GitHub
          const githubToken = process.env.GITHUB_TOKEN;
          const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
          const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
          const branch = "main";
          const metadataPath = "data/artists-metadata.json";

          if (githubToken) {
            const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${metadataPath}?ref=${branch}`;
            const getFileRes = await fetch(getFileUrl, {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: "application/vnd.github.v3+json",
              },
              cache: "no-store",
            });

            if (getFileRes.ok) {
              const fileData = await getFileRes.json();
              const content = Buffer.from(fileData.content, "base64").toString("utf-8");
              metadata = JSON.parse(content);
            }
          }
        } else {
          // Local: read from file system
          const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
          if (fs.existsSync(metadataPath)) {
            metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
          }
        }

        // Delete work from metadata
        if (metadata[artistSlug] && metadata[artistSlug].portfolio && metadata[artistSlug].portfolio[workId]) {
          delete metadata[artistSlug].portfolio[workId];
          
          // If portfolio is empty, remove it
          if (Object.keys(metadata[artistSlug].portfolio).length === 0) {
            delete metadata[artistSlug].portfolio;
          }

          // Save metadata
          if (isVercel) {
            // Commit to GitHub
            const result = await commitToGitHub({
              filePath: "data/artists-metadata.json",
              message: `Delete work: ${workId} from ${artistSlug}`,
              content: JSON.stringify(metadata, null, 2),
            });

            if (!result.success) {
              console.error("Error committing metadata deletion to GitHub:", result.error);
            }
          } else {
            // Local: write to file system
            const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
          }
        }
      } catch (metadataError: any) {
        console.error("Error deleting work from metadata:", metadataError);
        // Don't fail the request if metadata deletion fails
      }
    }

    return NextResponse.json({ success: true, message: "Görsel başarıyla silindi." });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { 
        error: isProduction ? "Dosya silinirken bir hata oluştu" : error.message || "Dosya silinirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getAllWorkData } = await import("@/data/artists");
    const works = getAllWorkData();
    return NextResponse.json({ works });
  } catch (error) {
    console.error("Error fetching works:", error);
    return NextResponse.json({ error: "Failed to fetch works" }, { status: 500 });
  }
}
