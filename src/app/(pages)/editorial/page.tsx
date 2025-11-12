import { getAllWorkData } from "@/data/artists";
import { EditorialClient } from "./EditorialClient";
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

export default async function EditorialPage() {
  let works = getAllWorkData();
  
  // On Vercel, also load works from GitHub metadata (for Blob Storage works)
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  if (isVercel) {
    try {
      const githubMetadata = await getMetadataFromGitHub();
      
      // Add works from metadata that might not be in file system
      for (const [slug, artistMeta] of Object.entries(githubMetadata)) {
        if (artistMeta && typeof artistMeta === "object" && "portfolio" in artistMeta) {
          const portfolio = artistMeta.portfolio as Record<string, any>;
          for (const [workId, workMeta] of Object.entries(portfolio)) {
            if (workMeta && typeof workMeta === "object" && "url" in workMeta) {
              // Check if work already exists
              const existingWork = works.find((w) => w.id === workId);
              if (!existingWork) {
                // Add work from metadata
                type Specialty = "Photographer" | "Editor" | "Retoucher" | "Videographer" | "Assistant" | "Graphic Designer";
                const specialtyValue = (artistMeta.specialty as string) || "Photographer";
                const getSpecialty = (value: string): Specialty => {
                  if (value === "Photographer" || value === "Editor" || value === "Retoucher" || 
                      value === "Videographer" || value === "Assistant" || value === "Graphic Designer") {
                    return value;
                  }
                  return "Photographer";
                };
                const specialty: Specialty = getSpecialty(specialtyValue);
                
                works.push({
                  id: workId,
                  url: workMeta.url as string,
                  alt: workMeta.alt as string || "",
                  type: (workMeta.type as "photo" | "video") || "photo",
                  projectTitle: workMeta.projectTitle as string || "",
                  brand: workMeta.brand as string || "",
                  videoUrl: workMeta.videoUrl as string | undefined,
                  artistName: artistMeta.name as string || slug,
                  artistSlug: slug,
                  artistSpecialty: specialty,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading works from GitHub metadata:", error);
    }
  }
  
  return <EditorialClient works={works} />;
}
