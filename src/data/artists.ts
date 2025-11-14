import fs from "fs";
import path from "path";

export interface WorkImage {
  id: string;
  url: string;
  alt: string;
  type: "photo" | "video";
  projectTitle: string;
  brand: string;
  videoUrl?: string; // YouTube or Vimeo URL for video type
}

export interface ArtistMeta {
  id: string;
  slug: string;
  name: string;
  specialty:
    | "Photographer"
    | "Editor"
    | "Retoucher"
    | "Videographer"
    | "Assistant"
    | "Graphic Designer";
  profileImageUrl: string;
  bio: string;
  fallbackPortfolio?: WorkImage[];
  instagram?: string;
  email?: string;
  phone?: string;
}

export interface Artist extends ArtistMeta {
  portfolio: WorkImage[];
}

const ARTIST_MEDIA_ROOT = path.join(process.cwd(), "public", "artists");
const VALID_MEDIA_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".mov",
]);

const ARTIST_DIRECTORY_SEPARATOR = "__";
const PROFILE_BASENAME = "profile";
const DEFAULT_BIO =
  "LUME'de portfolyosunu paylaşan yaratıcı.";

const artistsMeta: ArtistMeta[] = [
  {
    id: "1",
    slug: "murat-barlas",
    name: "Murat Barlas",
    specialty: "Photographer",
    profileImageUrl: "https://i.pravatar.cc/300?u=murat-barlas",
    bio: "Işık ve gölgenin peşinde koşan, anları ölümsüzleştiren bir görsel hikaye anlatıcısı.",
  },
];

function formatLabel(raw: string | null | undefined, context?: string): string {
  if (typeof raw !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.warn("formatLabel received non-string", { raw, context });
    }
    return "";
  }

  const cleaned = raw.trim();
  if (!cleaned) return "";

  const spaced = cleaned.replace(/[-_]+/g, " ");

  return spaced
    .split(" ")
    .filter(Boolean)
    .map((segment) => {
      const upper = segment.toUpperCase();
      if (segment.length <= 3 || /^[A-Z0-9]+$/.test(segment)) {
        return upper;
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join(" ");
}

function getArtistFolders(): string[] {
  if (!fs.existsSync(ARTIST_MEDIA_ROOT)) {
    return [];
  }

  return fs
    .readdirSync(ARTIST_MEDIA_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function buildWorkFromFilename(slug: string, fileName: string, index: number): WorkImage | null {
  const extension = path.extname(fileName).toLowerCase();

  if (!VALID_MEDIA_EXTENSIONS.has(extension)) {
    return null;
  }

  const base = path.basename(fileName, extension);
  const parts = base.split(ARTIST_DIRECTORY_SEPARATOR);

  let brandRaw: string | undefined;
  let projectRaw: string | undefined;
  let typeRaw: string | undefined;

  if (parts.length >= 2) {
    [brandRaw, projectRaw, typeRaw] = parts;
  } else {
    const [brandCandidate, ...rest] = base.split("_");
    if (brandCandidate && rest.length > 0) {
      brandRaw = brandCandidate;
      if (rest[rest.length - 1]?.toLowerCase() === "video") {
        typeRaw = rest.pop();
      }
      projectRaw = rest.join("_");
    }
  }

  if (!brandRaw || !projectRaw) {
    return {
      id: `${slug}-${index}`,
      url: `/artists/${slug}/${fileName}`,
      alt: formatLabel(base, "fallback-alt"),
      type: "photo",
      projectTitle: formatLabel(base, "fallback-project"),
      brand: formatLabel(slug, "fallback-brand"),
    };
  }

  const brand = formatLabel(brandRaw, "brand");
  const projectTitle = formatLabel(projectRaw, "project");
  const type = typeRaw?.toLowerCase() === "video" ? "video" : "photo";

  return {
    id: `${slug}-${index}`,
    url: `/artists/${slug}/${fileName}`,
    alt: `${brand} ${projectTitle}`.trim(),
    type,
    projectTitle: projectTitle || brand,
    brand: brand || formatLabel(slug, "brand-fallback"),
  };
}

function loadPortfolioFromDisk(slug: string): WorkImage[] {
  const directoryPath = path.join(ARTIST_MEDIA_ROOT, slug);
  const metadata = loadMetadata();
  const portfolioMetadata = metadata[slug]?.portfolio || {};
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

  // On Vercel, combine works from both file system (if accessible) and metadata
  // Note: On Vercel, file system is read-only but files from GitHub are available
  // We need to read from both sources and merge them
  const works: WorkImage[] = [];
  const workMap = new Map<string, WorkImage>();

  // First, try to read from file system (works from GitHub repo)
  if (fs.existsSync(directoryPath)) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    entries
      .filter((entry) => entry.isFile())
      .filter((entry) => !entry.name.toLowerCase().startsWith(`${PROFILE_BASENAME}.`))
      .forEach((entry, index) => {
        const work = buildWorkFromFilename(slug, entry.name, index);
        if (work) {
          workMap.set(work.id, work);
        }
      });
  }

  // Then, add/update works from metadata (Blob Storage works or metadata overrides)
  for (const [workId, workMeta] of Object.entries(portfolioMetadata)) {
    if (workMeta && typeof workMeta === "object") {
      if ("url" in workMeta) {
        // Full work info from metadata (Blob Storage work)
        workMap.set(workId, {
          id: workId,
          url: workMeta.url as string,
          alt: workMeta.alt as string || "",
          type: (workMeta.type as "photo" | "video") || "photo",
          projectTitle: workMeta.projectTitle as string || "",
          brand: workMeta.brand as string || "",
          videoUrl: workMeta.videoUrl as string | undefined,
        });
      } else if ("videoUrl" in workMeta) {
        // Only videoUrl override for existing file system work
        const existingWork = workMap.get(workId);
        if (existingWork) {
          existingWork.videoUrl = workMeta.videoUrl as string | undefined;
        }
      }
    }
  }

  return Array.from(workMap.values());
}

function findProfileImage(slug: string): string | null {
  const directoryPath = path.join(ARTIST_MEDIA_ROOT, slug);

  if (!fs.existsSync(directoryPath)) {
    return null;
  }

  const entry = fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .find(
      (candidate) =>
        candidate.isFile() && candidate.name.toLowerCase().startsWith(`${PROFILE_BASENAME}.`),
    );

  if (!entry) {
    return null;
  }

  return `/artists/${slug}/${entry.name}`;
}

interface PortfolioMetadata {
  [workId: string]: {
    videoUrl?: string;
    url?: string;
    alt?: string;
    type?: "photo" | "video";
    projectTitle?: string;
    brand?: string;
    fileName?: string;
  };
}

interface ArtistMetadata extends Partial<ArtistMeta> {
  portfolio?: PortfolioMetadata;
}

async function loadMetadataFromGitHub(): Promise<Record<string, ArtistMetadata>> {
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

function loadMetadata(): Record<string, ArtistMetadata> {
  // On Vercel, we can't use async in this context, so we'll handle it in getArtistsInternal
  // For now, try to read from file system
  const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
  if (fs.existsSync(metadataPath)) {
    try {
      return JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    } catch {
      return {};
    }
  }
  return {};
}

function ensureArtistMetaForSlug(slug: string): ArtistMeta {
  const knownMeta = artistsMeta.find((meta) => meta.slug === slug);
  const metadata = loadMetadata();
  const metadataOverride = metadata[slug];

  const baseMeta = knownMeta || {
    id: slug,
    slug,
    name: formatLabel(slug, "slug"),
    specialty: "Photographer" as const,
    profileImageUrl: `https://i.pravatar.cc/300?u=${slug}`,
    bio: DEFAULT_BIO,
  };

  return {
    ...baseMeta,
    ...(metadataOverride && {
      // Use metadata value if defined, otherwise use baseMeta value
      name: metadataOverride.name !== undefined ? metadataOverride.name : baseMeta.name,
      bio: metadataOverride.bio !== undefined ? metadataOverride.bio : baseMeta.bio,
      specialty: metadataOverride.specialty !== undefined ? metadataOverride.specialty : baseMeta.specialty,
      instagram: metadataOverride.instagram !== undefined ? (metadataOverride.instagram === null ? undefined : metadataOverride.instagram) : baseMeta.instagram,
      email: metadataOverride.email !== undefined ? (metadataOverride.email === null ? undefined : metadataOverride.email) : baseMeta.email,
      phone: metadataOverride.phone !== undefined ? (metadataOverride.phone === null ? undefined : metadataOverride.phone) : baseMeta.phone,
    }),
  };
}

const getArtistsInternal = () => {
  // Get all slugs from: hardcoded meta, folders, and metadata file
  const metadata = loadMetadata();
  const metadataSlugs = Object.keys(metadata);
  const folderSlugs = getArtistFolders();
  const hardcodedSlugs = artistsMeta.map((meta) => meta.slug);
  
  // Combine all unique slugs
  const allSlugs = Array.from(new Set([...hardcodedSlugs, ...folderSlugs, ...metadataSlugs]));
  
  return allSlugs.map((slug) => {
    const meta = ensureArtistMetaForSlug(slug);
    const diskPortfolio = loadPortfolioFromDisk(slug);
    const portfolio = diskPortfolio;
    const profileImage = findProfileImage(slug) ?? meta.profileImageUrl;

    return {
      ...meta,
      portfolio,
      profileImageUrl: profileImage,
    } satisfies Artist;
  });
};

export function getArtistsData() {
  return getArtistsInternal();
}

export function getArtistBySlug(slug: string) {
  const existing = getArtistsInternal().find((artist) => artist.slug === slug);
  if (existing) return existing;

  // Fallback: build directly from disk + default meta if not present in lists
  const meta = ensureArtistMetaForSlug(slug);
  const portfolio = loadPortfolioFromDisk(slug);
  const profileImage = findProfileImage(slug) ?? meta.profileImageUrl;

  if (portfolio.length === 0 && !fs.existsSync(path.join(ARTIST_MEDIA_ROOT, slug))) {
    return undefined;
  }

  return {
    ...meta,
    portfolio,
    profileImageUrl: profileImage,
  };
}

export function getAllWorkData() {
  return getArtistsInternal().flatMap((artist) =>
    artist.portfolio.map((work) => ({
      ...work,
      artistName: artist.name,
      artistSlug: artist.slug,
      artistSpecialty: artist.specialty,
    })),
  );
}

export type GalleryWork = WorkImage & {
  artistName: string;
  artistSlug: string;
  artistSpecialty: string;
};

