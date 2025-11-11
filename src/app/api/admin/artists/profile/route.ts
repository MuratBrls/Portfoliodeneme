import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";
import { validateFileUpload, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, MAX_FILE_SIZE } from "@/lib/security";
import { validateSlug } from "@/lib/security";

const ARTIST_MEDIA_ROOT = path.join(process.cwd(), "public", "artists");
const PROFILE_BASENAME = "profile";

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
    const slugRaw = (form.get("slug") as string | null)?.trim();

    if (!file || !slugRaw) {
      return NextResponse.json({ error: "slug ve file zorunludur" }, { status: 400 });
    }

    // Validate slug
    const slugValidation = validateSlug(slugRaw);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const slug = slugValidation.sanitized!;

    // Validate file upload (only images for profile)
    const fileValidation = validateFileUpload(file, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, MAX_FILE_SIZE);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Check if we're on Vercel and have Blob Storage token
    const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    const originalName = (file as any).name || "profile";
    const ext = path.extname(originalName) || ".jpg";
    const fileName = `${PROFILE_BASENAME}${ext.toLowerCase()}`;
    let publicUrl: string;

    // Use Vercel Blob Storage if available, otherwise use file system
    if (isVercel && hasBlobToken) {
      // Upload to Vercel Blob Storage
      try {
        // Delete old profile image if exists
        const oldBlobPath = `artists/${slug}/${PROFILE_BASENAME}.*`;
        // Note: Vercel Blob doesn't support wildcard deletion, so we'll just upload the new one
        
        const blobPath = `artists/${slug}/${fileName}`;
        const blob = await put(blobPath, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        publicUrl = blob.url;
      } catch (blobError: any) {
        console.error("Error uploading profile to Blob Storage:", blobError);
        return NextResponse.json(
          { 
            error: `Vercel Blob Storage'a yükleme başarısız: ${blobError.message}`,
          },
          { status: 500 }
        );
      }
    } else if (isVercel && !hasBlobToken) {
      return NextResponse.json(
        { 
          error: "Vercel'de profile image upload için Vercel Blob Storage gerekli. Lütfen Vercel Dashboard'da Blob Storage oluşturun.",
        },
        { status: 503 }
      );
    } else {
      // Local development: use file system
      const artistDir = path.join(ARTIST_MEDIA_ROOT, slug);
      if (!fs.existsSync(artistDir)) {
        fs.mkdirSync(artistDir, { recursive: true });
      }

      // remove old profile.* files
      const entries = fs.readdirSync(artistDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isFile() && e.name.toLowerCase().startsWith(`${PROFILE_BASENAME}.`)) {
          fs.unlinkSync(path.join(artistDir, e.name));
        }
      }

      const targetPath = path.join(artistDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));

      publicUrl = `/artists/${slug}/${fileName}`;
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Profile upload error:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { error: isProduction ? "Yükleme hatası" : error.message || "Yükleme hatası" },
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

    const artistDir = path.join(ARTIST_MEDIA_ROOT, slug);
    if (!fs.existsSync(artistDir)) {
      return NextResponse.json({ error: "Sanatçı klasörü bulunamadı" }, { status: 404 });
    }
    const entries = fs.readdirSync(artistDir, { withFileTypes: true });
    let deleted = false;
    for (const e of entries) {
      if (e.isFile() && e.name.toLowerCase().startsWith(`${PROFILE_BASENAME}.`)) {
        fs.unlinkSync(path.join(artistDir, e.name));
        deleted = true;
      }
    }
    if (!deleted) {
      return NextResponse.json({ error: "Profil görseli bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile delete error:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { error: isProduction ? "Silme hatası" : error.message || "Silme hatası" },
      { status: 500 }
    );
  }
}


