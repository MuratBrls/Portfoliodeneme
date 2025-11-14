import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { commitToGitHub } from "@/app/api/admin/github-commit/route";

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "artist-submissions.json");

interface ArtistSubmission {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  artist: {
    slug: string;
    name: string;
    bio: string;
    specialty: "Photographer" | "Editor" | "Retoucher" | "Videographer" | "Assistant" | "Graphic Designer";
    instagram?: string;
    email?: string;
    phone?: string;
  };
  profileImage?: {
    fileName: string;
    url: string;
  };
  works: Array<{
    brand: string;
    projectTitle: string;
    type: "photo" | "video";
    videoUrl?: string;
    fileName: string;
    url: string;
  }>;
  rejectionReason?: string;
}

async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

async function getSubmissionsFromGitHub(): Promise<Record<string, ArtistSubmission>> {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
  const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
  const branch = "main";
  const filePath = "data/artist-submissions.json";

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
  } catch (error) {
    console.error("Error loading submissions from GitHub:", error);
    return {};
  }
}

async function loadSubmissions(): Promise<Record<string, ArtistSubmission>> {
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

  if (isVercel) {
    // On Vercel, read from GitHub
    return await getSubmissionsFromGitHub();
  } else {
    // Local: read from file system
    try {
      if (!fs.existsSync(SUBMISSIONS_FILE)) {
        return {};
      }
      const content = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("Error loading submissions:", error);
      return {};
    }
  }
}

async function saveSubmissions(submissions: Record<string, ArtistSubmission>): Promise<void> {
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

  if (isVercel) {
    // On Vercel, commit to GitHub
    try {
      const result = await commitToGitHub({
        filePath: "data/artist-submissions.json",
        message: `Update submissions`,
        content: JSON.stringify(submissions, null, 2),
      });

      if (!result.success) {
        throw new Error(result.error || "GitHub'a commit edilemedi");
      }
    } catch (error: any) {
      console.error("Error saving submissions to GitHub:", error);
      throw new Error(`GitHub commit hatası: ${error.message || "Bilinmeyen hata"}`);
    }
  } else {
    // Local: write to file system
    try {
      const dataDir = path.dirname(SUBMISSIONS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    } catch (error) {
      console.error("Error saving submissions:", error);
      throw error;
    }
  }
}

async function getMetadataFromGitHub(): Promise<Record<string, any>> {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
  const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
  const branch = "main";
  const filePath = "data/artists-metadata.json";

  if (!githubToken) {
    throw new Error("GITHUB_TOKEN not set");
  }

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
}

async function moveSubmissionFilesToArtist(submission: ArtistSubmission): Promise<void> {
  // This function would move files from submissions directory to artists directory
  // For now, we'll keep the files in their original location since they're already in blob storage
  // In production, you might want to move them to a permanent location
  // For Vercel Blob Storage, files are already accessible via their URLs
  // For local development, you might want to move files from public/submissions to public/artists
}

async function addArtistToMetadata(submission: ArtistSubmission): Promise<void> {
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  let metadata: Record<string, any> = {};

  if (isVercel) {
    // On Vercel, read from GitHub
    try {
      metadata = await getMetadataFromGitHub();
    } catch (error: any) {
      throw new Error(`GitHub'dan metadata okunamadı: ${error.message}`);
    }
  } else {
    // Local: read from file system
    const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }
  }

  // Add artist metadata
  if (!metadata[submission.artist.slug]) {
    metadata[submission.artist.slug] = {};
  }

  metadata[submission.artist.slug] = {
    name: submission.artist.name,
    bio: submission.artist.bio,
    specialty: submission.artist.specialty,
    ...(submission.artist.instagram && { instagram: submission.artist.instagram }),
    ...(submission.artist.email && { email: submission.artist.email }),
    ...(submission.artist.phone && { phone: submission.artist.phone }),
  };

  // Add portfolio works
  if (!metadata[submission.artist.slug].portfolio) {
    metadata[submission.artist.slug].portfolio = {};
  }

  submission.works.forEach((work, index) => {
    const workId = `${submission.artist.slug}-${work.fileName.replace(/\.[^/.]+$/, "")}`;
    metadata[submission.artist.slug].portfolio[workId] = {
      url: work.url,
      alt: `${work.brand} ${work.projectTitle}`.trim(),
      type: work.type,
      projectTitle: work.projectTitle,
      brand: work.brand,
      fileName: work.fileName,
      ...(work.videoUrl && { videoUrl: work.videoUrl }),
    };
  });

  // Save metadata
  if (isVercel) {
    // Commit to GitHub
    try {
      const result = await commitToGitHub({
        filePath: "data/artists-metadata.json",
        message: `Add artist from submission: ${submission.artist.name}`,
        content: JSON.stringify(metadata, null, 2),
      });

      if (!result.success) {
        throw new Error(result.error || "GitHub'a commit edilemedi");
      }
    } catch (commitError: any) {
      throw new Error(`GitHub commit hatası: ${commitError.message || "Bilinmeyen hata"}`);
    }
  } else {
    // Local: write to file system
    const metadataPath = path.join(process.cwd(), "data", "artists-metadata.json");
    const dataDir = path.dirname(metadataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  // Move profile image if exists
  if (submission.profileImage) {
    // Profile image is already in blob storage or public/submissions
    // For now, we'll keep it in its current location
    // In production, you might want to move it to public/artists/{slug}/profile.jpg
  }
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const submissions = await loadSubmissions();
    let submissionsList = Object.values(submissions);

    // Filter by status if provided
    if (status && (status === "pending" || status === "approved" || status === "rejected")) {
      submissionsList = submissionsList.filter((s) => s.status === status);
    }

    // Sort by createdAt (newest first)
    submissionsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ submissions: submissionsList });
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: error?.message || "Başvurular yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const submissionId = body.id;
    const action = body.action; // "approve" or "reject"
    const rejectionReason = body.rejectionReason;

    if (!submissionId || !action) {
      return NextResponse.json({ error: "submissionId ve action gereklidir" }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action 'approve' veya 'reject' olmalıdır" }, { status: 400 });
    }

    const submissions = await loadSubmissions();
    const submission = submissions[submissionId];

    if (!submission) {
      return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
    }

    if (submission.status !== "pending") {
      return NextResponse.json({ error: "Bu başvuru zaten işlenmiş" }, { status: 400 });
    }

    if (action === "approve") {
      // Add artist to metadata
      try {
        await addArtistToMetadata(submission);
      } catch (error: any) {
        console.error("Error adding artist to metadata:", error);
        return NextResponse.json(
          { error: `Sanatçı eklenirken hata oluştu: ${error.message}` },
          { status: 500 }
        );
      }

      // Update submission status
      submission.status = "approved";
      submissions[submissionId] = submission;
      await saveSubmissions(submissions);

      // Send approval email to artist
      if (resend && submission.artist.email) {
        try {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          await resend.emails.send({
            from: fromEmail,
            to: submission.artist.email,
            subject: `Başvurunuz Onaylandı - ${submission.artist.name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Başvurunuz Onaylandı!</h2>
              <div style="margin-top: 20px;">
                <p>Merhaba ${submission.artist.name},</p>
                <p>Portfolyonuz incelendi ve onaylandı. Artık LUME'de profiliniz yayında!</p>
                <p style="margin-top: 20px;">
                  <strong>Profiliniz:</strong><br>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com"}/artists/${submission.artist.slug}" style="color: #000; text-decoration: underline;">
                    ${process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com"}/artists/${submission.artist.slug}
                  </a>
                </p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                <p>LUME</p>
              </div>
            </div>
          `,
            text: `
Başvurunuz Onaylandı!

Merhaba ${submission.artist.name},

Portfolyonuz incelendi ve onaylandı. Artık LUME'de profiliniz yayında!

Profiliniz: ${process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com"}/artists/${submission.artist.slug}

LUME
          `.trim(),
          });
        } catch (emailError) {
          console.error("Error sending approval email:", emailError);
          // Don't fail if email fails
        }
      }

      return NextResponse.json({
        success: true,
        message: "Başvuru onaylandı ve portfolyo eklendi",
      });
    } else if (action === "reject") {
      // Update submission status (submission already loaded above)
      submission.status = "rejected";
      submission.rejectionReason = rejectionReason || "";
      submissions[submissionId] = submission;
      await saveSubmissions(submissions);

      // Send rejection email to artist
      if (resend && submission.artist.email) {
        try {
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          await resend.emails.send({
            from: fromEmail,
            to: submission.artist.email,
            subject: `Başvuru Sonucu - ${submission.artist.name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Başvuru Sonucu</h2>
              <div style="margin-top: 20px;">
                <p>Merhaba ${submission.artist.name},</p>
                <p>Portfolyonuz incelendi ancak şu an için onaylanamadı.</p>
                ${rejectionReason ? `<p style="margin-top: 20px;"><strong>Sebep:</strong><br>${rejectionReason}</p>` : ""}
                <p style="margin-top: 20px;">Başka sorularınız varsa lütfen bizimle iletişime geçin.</p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                <p>LUME</p>
              </div>
            </div>
          `,
            text: `
Başvuru Sonucu

Merhaba ${submission.artist.name},

Portfolyonuz incelendi ancak şu an için onaylanamadı.
${rejectionReason ? `\nSebep: ${rejectionReason}` : ""}

Başka sorularınız varsa lütfen bizimle iletişime geçin.

LUME
          `.trim(),
          });
        } catch (emailError) {
          console.error("Error sending rejection email:", emailError);
          // Don't fail if email fails
        }
      }

      return NextResponse.json({
        success: true,
        message: "Başvuru reddedildi",
      });
    }
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: error?.message || "Başvuru güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

