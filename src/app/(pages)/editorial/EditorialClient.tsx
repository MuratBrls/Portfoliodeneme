"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryWork } from "@/data/artists";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

// Normalize brand name by removing trailing numbers and common variations
function normalizeBrandName(brand: string): string {
  if (!brand) return "";
  
  // Remove trailing numbers (BTS1 -> BTS, BTS2 -> BTS, BTS 1 -> BTS, BTS-1 -> BTS)
  let normalized = brand.trim();
  
  // Remove trailing numbers with optional spaces, hyphens, or underscores
  normalized = normalized.replace(/[\s\-_]*\d+$/, "").trim();
  
  // Convert to uppercase for consistent comparison
  return normalized.toUpperCase();
}

interface EditorialClientProps {
  works: GalleryWork[];
}

export function EditorialClient({ works }: EditorialClientProps) {
  const [selectedWork, setSelectedWork] = useState<GalleryWork | null>(null);

  // Group works by normalized brand name
  const brandMap = new Map<string, { displayName: string; works: GalleryWork[] }>();

  works.forEach((work) => {
    if (!work.brand) return;

    const normalized = normalizeBrandName(work.brand);
    const original = work.brand;

    if (!brandMap.has(normalized)) {
      brandMap.set(normalized, {
        displayName: original,
        works: [],
      });
    }

    const entry = brandMap.get(normalized)!;
    entry.works.push(work);

    // Prefer display name that matches normalized version (no trailing numbers)
    // Check if original, when normalized, equals the normalized key
    const originalNormalized = normalizeBrandName(original);
    if (originalNormalized === normalized) {
      // If original has no numbers (matches normalized), prefer it
      const currentNormalized = normalizeBrandName(entry.displayName);
      if (currentNormalized !== normalized || original.length <= entry.displayName.length) {
        entry.displayName = original;
      }
    }
  });

  // Convert to sorted array
  const brands = Array.from(brandMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([normalized, data]) => ({
      normalized,
      displayName: data.displayName,
      works: data.works,
    }));

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <header className="mb-12 space-y-3">
          <h1 className="text-3xl font-semibold uppercase tracking-[0.4em] text-neutral-900 dark:text-white">Editorial</h1>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Çalıştığımız markalar ve onlarla birlikte gerçekleştirdiğimiz projeler.
          </p>
        </header>

        {brands.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
            Henüz marka eklenmemiş
          </div>
        ) : (
          <section className="space-y-12">
            {brands.map(({ normalized, displayName, works: brandWorks }) => (
              <article key={normalized} className="space-y-4">
                <h2 className="text-xl font-semibold uppercase tracking-[0.2em] text-neutral-900 dark:text-white">{displayName}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {brandWorks.slice(0, 6).map((work) => (
                    <div
                      key={work.id}
                      className="relative aspect-square cursor-pointer overflow-hidden bg-neutral-100 transition-opacity hover:opacity-90 dark:bg-neutral-900"
                      onClick={() => setSelectedWork(work)}
                    >
                      <Image
                        src={work.url}
                        alt={work.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={work.url.includes("blob.vercel-storage.com") || work.url.includes("public.blob.vercel-storage.com")}
                      />
                    </div>
                  ))}
                </div>
                {brandWorks.length > 6 && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    +{brandWorks.length - 6} daha fazla görsel
                  </p>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
      <ImageLightbox
        imageUrl={selectedWork?.url || null}
        work={selectedWork || undefined}
        onClose={() => setSelectedWork(null)}
      />
    </>
  );
}

