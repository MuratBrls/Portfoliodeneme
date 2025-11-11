import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { validateFileUpload, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES, MAX_FILE_SIZE } from "@/lib/security";
import { validateSlug } from "@/lib/security";

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
    const allowedExtensions = type === "video" ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
    const allowedMimes = type === "video" ? ALLOWED_VIDEO_MIMES : ALLOWED_IMAGE_MIMES;
    const fileValidation = validateFileUpload(file, allowedExtensions, allowedMimes, MAX_FILE_SIZE);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Ensure artist directory exists (use sanitized slug)
    const artistDir = path.join(ARTIST_MEDIA_ROOT, sanitizedSlug);
    if (!fs.existsSync(artistDir)) {
      fs.mkdirSync(artistDir, { recursive: true });
    }

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
    const targetPath = path.join(artistDir, fileName);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/artists/${sanitizedSlug}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Dosya yüklendi",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { 
        error: isProduction ? "Yükleme sırasında hata oluştu" : error.message || "Yükleme sırasında hata oluştu",
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

    if (!imagePath) {
      return NextResponse.json({ error: "Image path is required" }, { status: 400 });
    }

    // Decode URL encoding
    imagePath = decodeURIComponent(imagePath);

    // Check if it's an external URL (http:// or https://)
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return NextResponse.json(
        { error: "Harici URL'lerden gelen görseller silinemez. Sadece yüklenmiş görseller silinebilir." },
        { status: 400 }
      );
    }

    // Remove leading slash if present and normalize path separators
    let cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    // Normalize path separators (handle both / and \) - Windows compatibility
    cleanPath = cleanPath.replace(/\\/g, "/");
    
    // Security: Ensure the path is within the artists directory
    // Normalize the path for comparison (case-insensitive on Windows)
    const normalizedCleanPath = cleanPath.toLowerCase();
    if (!normalizedCleanPath.startsWith("artists/")) {
      return NextResponse.json({ error: "Invalid path. Path must be within artists directory." }, { status: 400 });
    }

    // Build the full path
    const fullPath = path.join(process.cwd(), "public", cleanPath);
    const normalizedPath = path.resolve(fullPath); // Use resolve to get absolute path
    const normalizedRoot = path.resolve(ARTIST_MEDIA_ROOT);

    // Case-insensitive comparison for Windows
    const normalizedPathLower = normalizedPath.toLowerCase();
    const normalizedRootLower = normalizedRoot.toLowerCase();

    if (!normalizedPathLower.startsWith(normalizedRootLower)) {
      console.error("Path validation failed:", {
        normalizedPath,
        normalizedRoot,
        imagePath,
        cleanPath,
      });
      return NextResponse.json({ error: "Invalid path. Path is outside allowed directory." }, { status: 400 });
    }

    if (!fs.existsSync(normalizedPath)) {
      console.error("File not found:", {
        normalizedPath,
        normalizedRoot,
        imagePath,
        cleanPath,
        fullPath,
      });
      return NextResponse.json(
        { error: "Dosya bulunamadı." },
        { status: 404 }
      );
    }

    // Check if it's a file (not a directory)
    const stat = fs.statSync(normalizedPath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Bu bir dosya değil, bir klasör." }, { status: 400 });
    }

    try {
      fs.unlinkSync(normalizedPath);
      return NextResponse.json({ success: true, message: "Görsel başarıyla silindi." });
    } catch (unlinkError: any) {
      console.error("Error unlinking file:", unlinkError);
      const isProduction = process.env.NODE_ENV === "production";
      return NextResponse.json(
        { 
          error: isProduction ? "Dosya silinirken hata oluştu" : `Dosya silinirken hata oluştu: ${unlinkError.message}`,
        },
        { status: 500 }
      );
    }
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

