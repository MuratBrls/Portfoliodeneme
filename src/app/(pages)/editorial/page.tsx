import Image from "next/image";
import { getAllWorkData } from "@/data/artists";

export const revalidate = 0;

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

export default function EditorialPage() {
  const works = getAllWorkData();

  // Group works by normalized brand name
  const brandMap = new Map<string, { displayName: string; works: typeof works }>();

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
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <header className="mb-12 space-y-3">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.4em]">Editorial</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Çalıştığımız markalar ve onlarla birlikte gerçekleştirdiğimiz projeler.
        </p>
      </header>

      {brands.length === 0 ? (
        <div className="py-12 text-center text-neutral-500">
          Henüz marka eklenmemiş
        </div>
      ) : (
        <section className="space-y-12">
          {brands.map(({ normalized, displayName, works: brandWorks }) => (
            <article key={normalized} className="space-y-4">
              <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{displayName}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {brandWorks.slice(0, 6).map((work) => (
                  <div key={work.id} className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <Image
                      src={work.url}
                      alt={work.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
              {brandWorks.length > 6 && (
                <p className="text-xs text-neutral-500">
                  +{brandWorks.length - 6} daha fazla görsel
                </p>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
