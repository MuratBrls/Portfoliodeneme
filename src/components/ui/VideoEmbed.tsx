"use client";

import { useState } from "react";

interface VideoEmbedProps {
  url: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
}

// Extract video ID from YouTube URL
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Extract video ID from Vimeo URL
function getVimeoId(url: string): string | null {
  const patterns = [
    /(?:vimeo\.com\/)(\d+)/,
    /(?:player\.vimeo\.com\/video\/)(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Detect video platform
function getVideoPlatform(url: string): "youtube" | "vimeo" | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("vimeo.com")) {
    return "vimeo";
  }
  return null;
}

export function VideoEmbed({ url, thumbnailUrl, title, className = "" }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const platform = getVideoPlatform(url);

  if (!platform) {
    return (
      <div className={`flex aspect-[16/9] items-center justify-center bg-neutral-900 text-white ${className}`}>
        <p className="text-sm">Geçersiz video URL</p>
      </div>
    );
  }

  const youtubeId = platform === "youtube" ? getYouTubeId(url) : null;
  const vimeoId = platform === "vimeo" ? getVimeoId(url) : null;

  if (!youtubeId && !vimeoId) {
    return (
      <div className={`flex aspect-[16/9] items-center justify-center bg-neutral-900 text-white ${className}`}>
        <p className="text-sm">Video ID bulunamadı</p>
      </div>
    );
  }

  // Thumbnail URL
  const defaultThumbnail =
    platform === "youtube"
      ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      : `https://vumbnail.com/${vimeoId}.jpg`; // Vimeo thumbnail service

  const finalThumbnail = thumbnailUrl || defaultThumbnail;

  // Embed URL
  const embedUrl =
    platform === "youtube"
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;

  if (!isPlaying) {
    return (
      <div
        className={`relative h-full w-full cursor-pointer overflow-hidden bg-neutral-900 ${className}`}
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={finalThumbnail}
          alt={title || "Video thumbnail"}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to a placeholder if thumbnail fails to load
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%23111' width='16' height='9'/%3E%3C/svg%3E";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30">
          <div className="rounded-full bg-white/90 p-4 shadow-lg transition-transform hover:scale-110">
            <svg
              className="h-12 w-12 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-sm font-medium text-white">{title}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-neutral-900 ${className}`} style={{ aspectRatio: "16/9" }}>
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title || "Video player"}
      />
    </div>
  );
}

