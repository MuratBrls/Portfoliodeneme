import Image from "next/image";
import { notFound } from "next/navigation";
import { ArtistPortfolioGrid } from "@/components/sections/ArtistPortfolioGrid";
import { getArtistBySlug } from "@/data/artists";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

async function getMetadataFromGitHub(): Promise<Record<string, any>> {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
  const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
  const branch = "main";
  const filePath = "data/artists-metadata.json";

  if (!githubToken) {
    return {};
  }

  try {
    const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}?ref=${branch}`;
    const getFileRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    });

    if (!getFileRes.ok) {
      return {};
    }

    const fileData = await getFileRes.json();
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

function getMetadataFromLocal(): Record<string, any> {
  try {
    const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
    if (fs.existsSync(metadataPath)) {
      const content = fs.readFileSync(metadataPath, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors
  }
  return {};
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  let artist = getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  // Load metadata from GitHub (Vercel) or local file system (local dev)
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  let metadata: Record<string, any> = {};
  
  try {
    if (isVercel) {
      metadata = await getMetadataFromGitHub();
    } else {
      metadata = getMetadataFromLocal();
    }
    
    const meta = metadata[slug];
    if (meta) {
      // Merge metadata with artist data
      artist = {
        ...artist,
        name: meta.name !== undefined ? meta.name : artist.name,
        bio: meta.bio !== undefined ? meta.bio : artist.bio,
        specialty: meta.specialty !== undefined ? meta.specialty : artist.specialty,
        // null means field was deleted, undefined means use existing value
        instagram: meta.instagram !== undefined ? (meta.instagram === null ? undefined : meta.instagram) : artist.instagram,
        email: meta.email !== undefined ? (meta.email === null ? undefined : meta.email) : artist.email,
        phone: meta.phone !== undefined ? (meta.phone === null ? undefined : meta.phone) : artist.phone,
      };
    }
  } catch (error) {
    // If metadata read fails, use file system data
    console.error("Error loading metadata:", error);
  }

  const works = (artist.portfolio ?? []).map((work) => ({
    ...work,
    artistName: artist.name,
    artistSlug: artist.slug,
    artistSpecialty: artist.specialty,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6">
      <section className="mb-12 grid gap-8 md:grid-cols-[260px_1fr] md:items-start">
        {artist.profileImageUrl ? (
          <div className="overflow-hidden border border-black/5 dark:border-white/10">
            <Image
              src={artist.profileImageUrl}
              alt={artist.name}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center border border-dashed border-neutral-300 text-xs uppercase tracking-[0.2em] text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Profil görseli yok
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2 text-xs uppercase tracking-[0.3em]">
            <p className="text-sm font-semibold tracking-[0.2em] text-neutral-900 dark:text-white">
              {artist.name}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {artist.specialty}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
            {artist.bio}
          </p>
          {(artist.instagram || artist.email || artist.phone) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {artist.instagram && (
                <a
                  href={artist.instagram.startsWith("http") ? artist.instagram : `https://instagram.com/${artist.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-all duration-200 hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              )}
              {artist.email && (
                <a
                  href={`mailto:${artist.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-all duration-200 hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              )}
              {artist.phone && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-mono">{artist.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ArtistPortfolioGrid works={works} />
    </main>
  );
}

