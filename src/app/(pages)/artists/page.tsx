import Image from "next/image";
import Link from "next/link";
import { getArtistsData, type Artist } from "@/data/artists";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        Authorization: `Bearer ${githubToken}`,
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

export default async function ArtistsPage() {
  let artistsData: Artist[] = getArtistsData();
  
  // Load metadata from GitHub (Vercel) or local file system (local dev)
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  let metadata: Record<string, any> = {};
  
  try {
    if (isVercel) {
      metadata = await getMetadataFromGitHub();
    } else {
      metadata = getMetadataFromLocal();
    }
    
    // Get all slugs from metadata (including those not in folders)
    const metadataSlugs = Object.keys(metadata);
    const existingSlugs = new Set(artistsData.map((a) => a.slug));
    
    // Add artists that exist in metadata but not in the current list
    for (const slug of metadataSlugs) {
      if (!existingSlugs.has(slug)) {
        // This artist exists in metadata but not in folders/hardcoded
        // Add it to the list
        const meta = metadata[slug];
        artistsData.push({
          id: slug,
          slug,
          name: meta.name || slug,
          bio: meta.bio || "Multidisipliner kolektifimizin yeni üyesi. Görsel hikâyeler ve saf estetik arayışında.",
          specialty: meta.specialty || "Photographer",
          profileImageUrl: `https://i.pravatar.cc/300?u=${slug}`,
          portfolio: [],
          instagram: meta.instagram || undefined,
          email: meta.email || undefined,
          phone: meta.phone || undefined,
        });
      }
    }
    
    // Update existing artists with metadata
    artistsData = artistsData.map((artist) => {
      const meta = metadata[artist.slug];
      if (meta) {
        return {
          ...artist,
          name: meta.name !== undefined ? meta.name : artist.name,
          bio: meta.bio !== undefined ? meta.bio : artist.bio,
          specialty: meta.specialty !== undefined ? meta.specialty : artist.specialty,
          instagram: meta.instagram !== undefined ? (meta.instagram === null ? undefined : meta.instagram) : artist.instagram,
          email: meta.email !== undefined ? (meta.email === null ? undefined : meta.email) : artist.email,
          phone: meta.phone !== undefined ? (meta.phone === null ? undefined : meta.phone) : artist.phone,
        };
      }
      return artist;
    });
  } catch (error) {
    console.error("Error loading metadata:", error);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <header className="mb-12 space-y-3">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.4em] text-black dark:text-white">Artists</h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          Kolektif'in çekirdek kadrosu. Işıkla, renkle ve ritimle çalışan multidisipliner sanatçılar.
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

