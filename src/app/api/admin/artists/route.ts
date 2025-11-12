import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { validateSlug, sanitizeString, validateEmail } from "@/lib/security";
import { commitToGitHub } from "@/app/api/admin/github-commit/route";

const ARTIST_MEDIA_ROOT = path.join(process.cwd(), "public", "artists");

async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

async function getMetadataFromGitHub(): Promise<Record<string, any>> {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
  const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
  const branch = "main";
  const filePath = "data/artists-metadata.json";

  if (!githubToken) {
    throw new Error("GITHUB_TOKEN not set");
  }

  const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}?ref=${branch}`;
  const getFileRes = await fetch(getFileUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    cache: "no-store",
  });

  if (!getFileRes.ok) {
    // File doesn't exist, return empty object
    return {};
  }

  const fileData = await getFileRes.json();
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  return JSON.parse(content);
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getArtistsData } = await import("@/data/artists");
    let artists = getArtistsData();
    
    // On Vercel, also load metadata from GitHub to get latest updates
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
    if (isVercel) {
      try {
        const githubMetadata = await getMetadataFromGitHub();
        
        // Merge GitHub metadata with artists data
        artists = artists.map((artist) => {
          const githubMeta = githubMetadata[artist.slug];
          if (githubMeta) {
            return {
              ...artist,
              name: githubMeta.name !== undefined ? githubMeta.name : artist.name,
              bio: githubMeta.bio !== undefined ? githubMeta.bio : artist.bio,
              specialty: githubMeta.specialty !== undefined ? githubMeta.specialty : artist.specialty,
              // null means field was deleted, undefined means use existing value
              instagram: githubMeta.instagram !== undefined ? (githubMeta.instagram === null ? undefined : githubMeta.instagram) : artist.instagram,
              email: githubMeta.email !== undefined ? (githubMeta.email === null ? undefined : githubMeta.email) : artist.email,
              phone: githubMeta.phone !== undefined ? (githubMeta.phone === null ? undefined : githubMeta.phone) : artist.phone,
            };
          }
          return artist;
        });
      } catch (error) {
        // If GitHub read fails, use file system data
        console.error("Error loading metadata from GitHub:", error);
      }
    }
    
    return NextResponse.json({ artists });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slugRaw = (body.slug as string | undefined)?.trim();
    const nameRaw = (body.name as string | undefined)?.trim();
    const bioRaw = (body.bio as string | undefined)?.trim() || "";
    const specialtyRaw = (body.specialty as string | undefined)?.trim() || "Photographer";
    const instagramRaw = (body.instagram as string | undefined)?.trim() || "";
    const emailRaw = (body.email as string | undefined)?.trim() || "";
    const phoneRaw = (body.phone as string | undefined)?.trim() || "";

    // Validate slug
    if (!slugRaw || !nameRaw) {
      return NextResponse.json({ error: "slug ve name zorunludur" }, { status: 400 });
    }

    const slugValidation = validateSlug(slugRaw);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const slug = slugValidation.sanitized!;

    // Sanitize and validate inputs
    const name = sanitizeString(nameRaw, 200);
    const bio = sanitizeString(bioRaw, 1000);
    const specialty = sanitizeString(specialtyRaw, 50);
    
    // Validate specialty
    const validSpecialties = ["Photographer", "Editor", "Retoucher", "Videographer", "Assistant", "Graphic Designer"];
    if (!validSpecialties.includes(specialty)) {
      return NextResponse.json({ error: "Invalid specialty" }, { status: 400 });
    }

    // Validate and sanitize contact info
    let instagram = "";
    if (instagramRaw) {
      instagram = sanitizeString(instagramRaw, 200);
      // Basic URL validation for Instagram
      if (!instagram.match(/^(@[a-zA-Z0-9_.]+|https?:\/\/.+)$/)) {
        return NextResponse.json({ error: "Invalid Instagram format" }, { status: 400 });
      }
    }

    let email = "";
    if (emailRaw) {
      email = emailRaw.trim().toLowerCase();
      if (!validateEmail(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
    }

    const phone = sanitizeString(phoneRaw, 20);

    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

    let metadata: Record<string, any> = {};

    if (isVercel) {
      // On Vercel, read from GitHub
      try {
        metadata = await getMetadataFromGitHub();
      } catch (error: any) {
        return NextResponse.json(
          { error: `GitHub'dan metadata okunamadı: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      // Local: read from file system
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      }
    }

    // Check if artist already exists in metadata
    if (metadata[slug]) {
      return NextResponse.json({ error: "Bu slug zaten mevcut. Güncelleme için PATCH kullanın." }, { status: 400 });
    }
    
    // If artist folder exists but no metadata, allow adding metadata
    // This allows adding metadata for artists that exist only as folders

      metadata[slug] = {
        name,
        bio,
        specialty: specialty as any,
        ...(instagram && { instagram }),
        ...(email && { email }),
        ...(phone && { phone }),
      };
      
      // Remove null fields (they were explicitly set to empty)
      if (metadata[slug].instagram === null) delete metadata[slug].instagram;
      if (metadata[slug].email === null) delete metadata[slug].email;
      if (metadata[slug].phone === null) delete metadata[slug].phone;

    // Write to file system (for local dev)
    if (!isVercel) {
      const dataDir = path.join(process.cwd(), "data");
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      // create artist folder (only on local)
      const dir = path.join(ARTIST_MEDIA_ROOT, slug);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // If on Vercel, commit to GitHub automatically
    if (isVercel) {
      try {
        const result = await commitToGitHub({
          filePath: "data/artists-metadata.json",
          message: `Add artist: ${name}`,
          content: JSON.stringify(metadata, null, 2),
        });
        
        if (!result.success) {
          console.error("GitHub commit failed:", result.error);
          return NextResponse.json(
            { error: `GitHub'a commit edilemedi: ${result.error || "Bilinmeyen hata"}` },
            { status: 500 }
          );
        }
      } catch (commitError: any) {
        console.error("Error committing to GitHub:", commitError);
        return NextResponse.json(
          { error: `GitHub commit hatası: ${commitError.message || "Bilinmeyen hata"}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating artist:", error);
    return NextResponse.json(
      { 
        error: error.message || "Artist oluşturulamadı",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slugRaw = body.slug;

    if (!slugRaw) {
      return NextResponse.json({ error: "Artist slug is required" }, { status: 400 });
    }

    // Validate slug
    const slugValidation = validateSlug(slugRaw);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const slug = slugValidation.sanitized!;

    // Sanitize inputs
    const name = body.name !== undefined ? sanitizeString(body.name, 200) : undefined;
    const bio = body.bio !== undefined ? sanitizeString(body.bio, 1000) : undefined;
    const specialtyRaw = body.specialty !== undefined ? sanitizeString(body.specialty, 50) : undefined;
    const instagramRaw = body.instagram !== undefined ? sanitizeString(body.instagram, 200) : undefined;
    const emailRaw = body.email !== undefined ? body.email.trim().toLowerCase() : undefined;
    const phoneRaw = body.phone !== undefined ? sanitizeString(body.phone, 20) : undefined;

    // Validate specialty if provided
    if (specialtyRaw !== undefined) {
      const validSpecialties = ["Photographer", "Editor", "Retoucher", "Videographer", "Assistant", "Graphic Designer"];
      if (!validSpecialties.includes(specialtyRaw)) {
        return NextResponse.json({ error: "Invalid specialty" }, { status: 400 });
      }
    }

    // Validate email if provided
    if (emailRaw !== undefined && emailRaw !== "" && !validateEmail(emailRaw)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate Instagram if provided
    if (instagramRaw !== undefined && instagramRaw !== "" && !instagramRaw.match(/^(@[a-zA-Z0-9_.]+|https?:\/\/.+)$/)) {
      return NextResponse.json({ error: "Invalid Instagram format" }, { status: 400 });
    }

    const specialty = specialtyRaw;
    const instagram = instagramRaw;
    const email = emailRaw;
    const phone = phoneRaw;

    // This is a simple approach - in production, use a database
    // For now, we'll create a separate metadata file
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

    let metadata: Record<string, any> = {};

    if (isVercel) {
      // On Vercel, read from GitHub
      try {
        metadata = await getMetadataFromGitHub();
      } catch (error: any) {
        return NextResponse.json(
          { error: `GitHub'dan metadata okunamadı: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      // Local: read from file system
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      }
    }

    if (!metadata[slug]) {
      metadata[slug] = {};
    }

    if (name !== undefined) metadata[slug].name = name;
    if (bio !== undefined) metadata[slug].bio = bio;
    if (specialty !== undefined) metadata[slug].specialty = specialty as any;
    if (instagram !== undefined) {
      // Empty string means remove the field (set to null to mark for deletion)
      if (instagram === "") {
        metadata[slug].instagram = null;
      } else {
        metadata[slug].instagram = instagram;
      }
    }
    if (email !== undefined) {
      // Empty string means remove the field (set to null to mark for deletion)
      if (email === "") {
        metadata[slug].email = null;
      } else {
        metadata[slug].email = email;
      }
    }
    if (phone !== undefined) {
      // Empty string means remove the field (set to null to mark for deletion)
      if (phone === "") {
        metadata[slug].phone = null;
      } else {
        metadata[slug].phone = phone;
      }
    }

    // Write to file system (for local dev)
    if (!isVercel) {
      const dataDir = path.join(process.cwd(), "data");
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    // If on Vercel, commit to GitHub automatically
    if (isVercel) {
      try {
        const result = await commitToGitHub({
          filePath: "data/artists-metadata.json",
          message: `Update artist: ${slug}`,
          content: JSON.stringify(metadata, null, 2),
        });
        
        if (!result.success) {
          console.error("GitHub commit failed:", result.error);
          return NextResponse.json(
            { error: result.error || "GitHub'a commit edilemedi" },
            { status: 500 }
          );
        }
      } catch (commitError: any) {
        console.error("Error committing to GitHub:", commitError);
        return NextResponse.json(
          { error: `GitHub commit hatası: ${commitError.message || "Bilinmeyen hata"}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating artist:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { 
        error: isProduction 
          ? "Sanatçı güncellenemedi" 
          : (error.message || "Sanatçı güncellenemedi"),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slugRaw = searchParams.get("slug");

    if (!slugRaw) {
      return NextResponse.json({ error: "slug gereklidir" }, { status: 400 });
    }

    // Validate slug
    const slugValidation = validateSlug(slugRaw);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const slug = slugValidation.sanitized!;

    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

    let metadata: Record<string, any> = {};

    if (isVercel) {
      // On Vercel, read from GitHub
      try {
        metadata = await getMetadataFromGitHub();
      } catch (error: any) {
        return NextResponse.json(
          { error: `GitHub'dan metadata okunamadı: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      // Local: read from file system
      const dataDir = path.join(process.cwd(), "data");
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      }
    }

    if (metadata[slug]) {
      delete metadata[slug];
    }

    // Write to file system (for local dev)
    if (!isVercel) {
      const dataDir = path.join(process.cwd(), "data");
      const metadataPath = path.join(dataDir, "artists-metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      // remove folder recursively (only on local)
      const dir = path.join(ARTIST_MEDIA_ROOT, slug);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }

    // If on Vercel, commit to GitHub automatically
    if (isVercel) {
      try {
        const result = await commitToGitHub({
          filePath: "data/artists-metadata.json",
          message: `Delete artist: ${slug}`,
          content: JSON.stringify(metadata, null, 2),
        });
        
        if (!result.success) {
          console.error("GitHub commit failed:", result.error);
          return NextResponse.json(
            { error: result.error || "GitHub'a commit edilemedi" },
            { status: 500 }
          );
        }
      } catch (commitError: any) {
        console.error("Error committing to GitHub:", commitError);
        return NextResponse.json(
          { error: `GitHub commit hatası: ${commitError.message || "Bilinmeyen hata"}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting artist:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { 
        error: isProduction 
          ? "Artist silinemedi" 
          : (error.message || "Artist silinemedi"),
      },
      { status: 500 }
    );
  }
}

