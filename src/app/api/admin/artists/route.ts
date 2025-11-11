import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { validateSlug, sanitizeString, validateEmail } from "@/lib/security";

const ARTIST_MEDIA_ROOT = path.join(process.cwd(), "public", "artists");

async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { getArtistsData } = await import("@/data/artists");
    const artists = getArtistsData();
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

    // ensure data dir
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const metadataPath = path.join(dataDir, "artists-metadata.json");

    let metadata: Record<string, any> = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }

    if (metadata[slug]) {
      return NextResponse.json({ error: "Bu slug zaten mevcut" }, { status: 400 });
    }

    metadata[slug] = {
      name,
      bio,
      specialty: specialty as any,
      ...(instagram && { instagram }),
      ...(email && { email }),
      ...(phone && { phone }),
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // create artist folder
    const dir = path.join(ARTIST_MEDIA_ROOT, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating artist:", error);
    return NextResponse.json({ error: "Artist oluşturulamadı" }, { status: 500 });
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
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const metadataPath = path.join(dataDir, "artists-metadata.json");
    let metadata: Record<string, any> = {};

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }

    if (!metadata[slug]) {
      metadata[slug] = {};
    }

    if (name !== undefined) metadata[slug].name = name;
    if (bio !== undefined) metadata[slug].bio = bio;
    if (specialty !== undefined) metadata[slug].specialty = specialty as any;
    if (instagram !== undefined) metadata[slug].instagram = instagram || undefined;
    if (email !== undefined) metadata[slug].email = email || undefined;
    if (phone !== undefined) metadata[slug].phone = phone || undefined;

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating artist:", error);
    return NextResponse.json({ error: "Failed to update artist" }, { status: 500 });
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

    // metadata remove
    const dataDir = path.join(process.cwd(), "data");
    const metadataPath = path.join(dataDir, "artists-metadata.json");
    let metadata: Record<string, any> = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }
    if (metadata[slug]) {
      delete metadata[slug];
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }

    // remove folder recursively
    const dir = path.join(ARTIST_MEDIA_ROOT, slug);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting artist:", error);
    return NextResponse.json({ error: "Artist silinemedi" }, { status: 500 });
  }
}

