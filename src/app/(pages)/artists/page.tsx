import Image from "next/image";
import Link from "next/link";
import { getArtistsData } from "@/data/artists";

export default function ArtistsPage() {
  const artistsData = getArtistsData();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <header className="mb-12 space-y-3">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.4em]">Artists</h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          Kolektif’in çekirdek kadrosu. Işıkla, renkle ve ritimle çalışan multidisipliner sanatçılar.
        </p>
      </header>
      <section className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {artistsData.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.slug}`}
            className="group flex flex-col gap-4"
          >
            <div className="overflow-hidden bg-neutral-200">
              <Image
                src={artist.profileImageUrl}
                alt={artist.name}
                width={600}
                height={600}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 text-xs uppercase tracking-[0.3em]">
              <span className="block text-sm font-semibold tracking-[0.2em]">
                {artist.name}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                {artist.specialty}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

