"use client";

import { useState } from "react";
import type { GalleryWork } from "@/data/artists";
import { GalleryGridItem } from "@/components/ui/GalleryGridItem";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

interface HomeGalleryProps {
  works: GalleryWork[];
}

export function HomeGallery({ works }: HomeGalleryProps) {
  const [selectedWork, setSelectedWork] = useState<GalleryWork | null>(null);

  return (
    <>
      <main className="px-4 py-10 md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div
            id="masonry-grid"
            className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 lg:gap-8"
          >
            {works.map((work) => (
              <GalleryGridItem
                key={work.id}
                work={work}
                onImageClick={(url) => {
                  const clickedWork = works.find((w) => w.url === url);
                  setSelectedWork(clickedWork || null);
                }}
              />
            ))}
          </div>
        </div>
      </main>
      <ImageLightbox
        imageUrl={selectedWork?.url || null}
        work={selectedWork || undefined}
        onClose={() => setSelectedWork(null)}
      />
    </>
  );
}

