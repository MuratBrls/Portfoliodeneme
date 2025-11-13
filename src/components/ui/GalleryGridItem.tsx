"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GalleryWork } from "@/data/artists";
import { VideoEmbed } from "./VideoEmbed";

interface GalleryGridItemProps {
  work: GalleryWork;
  onImageClick: (url: string) => void;
}

const overlayVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 0.7 },
};

const creditVariants = {
  rest: { opacity: 0, y: 12 },
  hover: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.05,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function GalleryGridItem({ work, onImageClick }: GalleryGridItemProps) {
  const isVideo = work.type === "video";
  const videoUrl = work.videoUrl;
  const hasVideoUrl = isVideo && videoUrl && typeof videoUrl === "string";

  const handleClick = () => {
    if (!isVideo) {
      onImageClick(work.url);
    }
  };

  return (
    <motion.div
      layout
      initial="rest"
      whileHover="hover"
      animate="rest"
      className="relative mb-4 break-inside-avoid cursor-pointer overflow-hidden lg:mb-8"
      onClick={handleClick}
    >
      {isVideo && hasVideoUrl && videoUrl ? (
        <div className="w-full" style={{ aspectRatio: "3/4" }}>
          <VideoEmbed
            url={videoUrl}
            thumbnailUrl={work.url}
            title={work.projectTitle}
            className="h-full w-full"
          />
        </div>
      ) : isVideo ? (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-neutral-200 text-xs uppercase tracking-[0.2em] text-neutral-700 dark:bg-neutral-800 dark:text-white">
          Video: {work.projectTitle}
        </div>
      ) : (
        <Image
          src={work.url}
          alt={work.alt}
          width={800}
          height={1000}
          className="h-auto w-full object-cover"
          priority={false}
          unoptimized={work.url.includes("blob.vercel-storage.com") || work.url.includes("public.blob.vercel-storage.com")}
        />
      )}

      {!hasVideoUrl && (
        <motion.div
          variants={overlayVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      )}

      {!hasVideoUrl && (
        <motion.div
          variants={creditVariants}
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full p-4 text-white"
        >
          <Link
            href={`/artists/${work.artistSlug}`}
            className="pointer-events-auto text-lg font-semibold tracking-wide hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {work.artistName}
          </Link>
          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/80">
            {work.artistSpecialty}
          </div>
          <div className="my-3 h-px w-6 bg-white/70" />
          <div className="space-y-1 text-sm">
            <span className="block text-white/80">{work.brand}</span>
            <span className="block font-light tracking-wide">{work.projectTitle}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

