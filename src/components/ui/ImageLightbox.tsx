"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
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
              alt="Expanded work image"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.2s ease-in-out",
              }}
              onLoad={() => setImageLoaded(true)}
            />
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

