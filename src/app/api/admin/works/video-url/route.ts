import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { validateSlug } from "@/lib/security";

const METADATA_PATH = path.join(process.cwd(), "data", "artists-metadata.json");

async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

// Validate YouTube or Vimeo URL
function isValidVideoUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  
  const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)[\w-]+/;
  const vimeoPattern = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)\d+/;
  
  return youtubePattern.test(url) || vimeoPattern.test(url);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { workId, videoUrl, artistSlug } = body;

    if (!workId || !artistSlug) {
      return NextResponse.json({ error: "workId and artistSlug are required" }, { status: 400 });
    }

    // Validate artist slug
    const slugValidation = validateSlug(artistSlug);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }

    // Validate video URL if provided
    if (videoUrl && !isValidVideoUrl(videoUrl)) {
      return NextResponse.json(
        { error: "Geçersiz video URL. YouTube veya Vimeo URL'si girin." },
        { status: 400 }
      );
    }

    // Load existing metadata
    let metadata: Record<string, any> = {};
    if (fs.existsSync(METADATA_PATH)) {
      try {
        metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));
      } catch (error) {
        console.error("Error reading metadata:", error);
        metadata = {};
      }
    }

    // Initialize artist metadata if not exists
    if (!metadata[artistSlug]) {
      metadata[artistSlug] = {};
    }

    // Initialize portfolio metadata if not exists
    if (!metadata[artistSlug].portfolio) {
      metadata[artistSlug].portfolio = {};
    }

    // Update video URL
    if (videoUrl) {
      metadata[artistSlug].portfolio[workId] = {
        ...metadata[artistSlug].portfolio[workId],
        videoUrl: videoUrl.trim(),
      };
    } else {
      // Remove video URL if empty
      if (metadata[artistSlug].portfolio[workId]) {
        delete metadata[artistSlug].portfolio[workId].videoUrl;
        // Remove work entry if empty
        if (Object.keys(metadata[artistSlug].portfolio[workId]).length === 0) {
          delete metadata[artistSlug].portfolio[workId];
        }
      }
    }

    // Ensure data directory exists
    const dataDir = path.dirname(METADATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write metadata
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: videoUrl ? "Video URL eklendi" : "Video URL silindi",
    });
  } catch (error: any) {
    console.error("Error updating video URL:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      {
        error: isProduction
          ? "Video URL güncellenirken hata oluştu"
          : error.message || "Video URL güncellenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

