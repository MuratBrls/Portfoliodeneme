"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { GalleryWork } from "@/data/artists";

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  work?: GalleryWork;
}

export function ImageLightbox({ imageUrl, onClose, work }: ImageLightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!imageUrl) {
      setImageLoaded(false);
      return;
    }

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    setImageLoaded(false);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, imageUrl]);

  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            {!imageLoaded && (
              <div className="absolute flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={work?.alt || "Expanded work image"}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
              onLoad={() => setImageLoaded(true)}
            />
            {work && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mx-auto max-w-2xl space-y-3">
                  {work.artistName && (
                    <Link
                      href={`/artists/${work.artistSlug}`}
                      className="block text-lg font-semibold tracking-wide text-white hover:underline"
                    >
                      {work.artistName}
                    </Link>
                  )}
                  {work.artistSpecialty && (
                    <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                      {work.artistSpecialty}
                    </div>
                  )}
                  <div className="h-px w-12 bg-white/70" />
                  <div className="space-y-1">
                    {work.brand && (
                      <div className="text-sm text-white/80">{work.brand}</div>
                    )}
                    {work.projectTitle && (
                      <div className="text-base font-light tracking-wide text-white">
                        {work.projectTitle}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-md bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

