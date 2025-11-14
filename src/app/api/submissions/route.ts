import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeString, validateEmail, validateSlug, validateFileUpload, ALLOWED_IMAGE_EXTENSIONS, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_EXTENSIONS, ALLOWED_VIDEO_MIMES, MAX_FILE_SIZE } from "@/lib/security";

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "artist-submissions.json");

interface WorkSubmission {
  file: File;
  brand: string;
  projectTitle: string;
  type: "photo" | "video";
  videoUrl?: string;
  fileName?: string;
  url?: string;
}

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
    const { commitToGitHub } = await import("@/app/api/admin/github-commit/route");
    try {
      const result = await commitToGitHub({
        filePath: "data/artist-submissions.json",
        message: `Add submission: ${Object.values(submissions)[Object.values(submissions).length - 1]?.artist.name || "new"}`,
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

async function uploadFileToStorage(file: File, slug: string, fileName: string): Promise<string> {
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (isVercel && hasBlobToken) {
    // Upload to Vercel Blob Storage
    const blobPath = `submissions/${slug}/${fileName}`;
    const blob = await put(blobPath, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  } else {
    // Local: save to temporary submissions directory
    const submissionsDir = path.join(process.cwd(), "public", "submissions", slug);
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }
    const targetPath = path.join(submissionsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(targetPath, buffer);
    return `/submissions/${slug}/${fileName}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 submissions per day per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`submission-${clientIP}`, 3, 24 * 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Günlük başvuru limitine ulaştınız. Lütfen yarın tekrar deneyin." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    
    // Extract artist information
    const slugRaw = (formData.get("slug") as string | null)?.trim();
    const nameRaw = (formData.get("name") as string | null)?.trim();
    const bioRaw = (formData.get("bio") as string | null)?.trim() || "";
    const specialtyRaw = (formData.get("specialty") as string | null)?.trim() || "Photographer";
    const instagramRaw = (formData.get("instagram") as string | null)?.trim() || "";
    const emailRaw = (formData.get("email") as string | null)?.trim() || "";
    const phoneRaw = (formData.get("phone") as string | null)?.trim() || "";

    // Validate slug
    if (!slugRaw || !nameRaw) {
      return NextResponse.json({ error: "Slug ve isim zorunludur" }, { status: 400 });
    }

    const slugValidation = validateSlug(slugRaw);
    if (!slugValidation.valid) {
      return NextResponse.json({ error: slugValidation.error }, { status: 400 });
    }
    const slug = slugValidation.sanitized!;

    // Check if slug already exists in submissions or artists
    const submissions = await loadSubmissions();
    const existingSubmission = Object.values(submissions).find(
      (s) => s.artist.slug === slug && s.status === "pending"
    );
    if (existingSubmission) {
      return NextResponse.json({ error: "Bu slug ile zaten bekleyen bir başvuru var" }, { status: 400 });
    }

    // Check if artist already exists
    try {
      const { getArtistsData } = await import("@/data/artists");
      const artists = getArtistsData();
      if (artists.some((a) => a.slug === slug)) {
        return NextResponse.json({ error: "Bu slug ile zaten bir sanatçı mevcut" }, { status: 400 });
      }
    } catch (error) {
      // If check fails, continue (might be a race condition)
      console.error("Error checking existing artists:", error);
    }

    // Sanitize and validate inputs
    const name = sanitizeString(nameRaw, 200);
    const bio = sanitizeString(bioRaw, 1000);
    const specialty = sanitizeString(specialtyRaw, 50);
    
    // Validate specialty
    const validSpecialties = ["Photographer", "Editor", "Retoucher", "Videographer", "Assistant", "Graphic Designer"];
    if (!validSpecialties.includes(specialty)) {
      return NextResponse.json({ error: "Geçersiz uzmanlık alanı" }, { status: 400 });
    }

    // Validate and sanitize contact info
    let instagram = "";
    if (instagramRaw) {
      instagram = sanitizeString(instagramRaw, 200);
      if (!instagram.match(/^(@[a-zA-Z0-9_.]+|https?:\/\/.+)$/)) {
        return NextResponse.json({ error: "Geçersiz Instagram formatı" }, { status: 400 });
      }
    }

    let email = "";
    if (emailRaw) {
      email = emailRaw.trim().toLowerCase();
      if (!validateEmail(email)) {
        return NextResponse.json({ error: "Geçersiz e-posta formatı" }, { status: 400 });
      }
    }

    const phone = sanitizeString(phoneRaw, 20);

    // Handle profile image
    const profileFile = formData.get("profileImage") as File | null;
    let profileImage: { fileName: string; url: string } | undefined;

    if (profileFile && profileFile.size > 0) {
      const profileValidation = validateFileUpload(
        profileFile,
        ALLOWED_IMAGE_EXTENSIONS,
        ALLOWED_IMAGE_MIMES,
        MAX_FILE_SIZE
      );
      if (!profileValidation.valid) {
        return NextResponse.json({ error: `Profil resmi: ${profileValidation.error}` }, { status: 400 });
      }

      const profileExt = path.extname(profileFile.name || "profile.jpg");
      const profileFileName = `profile${profileExt}`;
      const profileUrl = await uploadFileToStorage(profileFile, slug, profileFileName);
      profileImage = { fileName: profileFileName, url: profileUrl };
    }

    // Handle works
    const worksCount = parseInt((formData.get("worksCount") as string) || "0", 10);
    const works: Array<{
      brand: string;
      projectTitle: string;
      type: "photo" | "video";
      videoUrl?: string;
      fileName: string;
      url: string;
    }> = [];

    for (let i = 0; i < worksCount; i++) {
      const workFile = formData.get(`work_${i}_file`) as File | null;
      if (!workFile || workFile.size === 0) continue;

      const brand = sanitizeString((formData.get(`work_${i}_brand`) as string) || "", 100);
      const projectTitle = sanitizeString((formData.get(`work_${i}_projectTitle`) as string) || "", 100);
      const typeRaw = (formData.get(`work_${i}_type`) as string) || "photo";
      const type = typeRaw === "video" ? "video" : "photo";
      const videoUrl = sanitizeString((formData.get(`work_${i}_videoUrl`) as string) || "", 500);

      // Validate file
      let allowedExtensions: string[];
      let allowedMimes: string[];
      
      if (type === "video") {
        allowedExtensions = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS];
        allowedMimes = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
      } else {
        allowedExtensions = ALLOWED_IMAGE_EXTENSIONS;
        allowedMimes = ALLOWED_IMAGE_MIMES;
      }

      const workValidation = validateFileUpload(workFile, allowedExtensions, allowedMimes, MAX_FILE_SIZE);
      if (!workValidation.valid) {
        return NextResponse.json({ error: `Çalışma ${i + 1}: ${workValidation.error}` }, { status: 400 });
      }

      // Generate filename
      const safe = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const workExt = path.extname(workFile.name || "work.jpg");
      const baseName = brand && projectTitle
        ? `${safe(brand)}__${safe(projectTitle)}__${type}`
        : `work-${i + 1}-${Date.now()}`;
      const workFileName = `${baseName}${workExt}`;

      // Upload work file
      const workUrl = await uploadFileToStorage(workFile, slug, workFileName);

      works.push({
        brand: brand || "Unknown",
        projectTitle: projectTitle || "Untitled",
        type,
        videoUrl: videoUrl || undefined,
        fileName: workFileName,
        url: workUrl,
      });
    }

    if (works.length === 0) {
      return NextResponse.json({ error: "En az bir çalışma yüklenmelidir" }, { status: 400 });
    }

    // Create submission
    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const submission: ArtistSubmission = {
      id: submissionId,
      createdAt: new Date().toISOString(),
      status: "pending",
      artist: {
        slug,
        name,
        bio,
        specialty: specialty as any,
        instagram: instagram || undefined,
        email: email || undefined,
        phone: phone || undefined,
      },
      profileImage,
      works,
    };

    // Save submission
    submissions[submissionId] = submission;
    await saveSubmissions(submissions);

    // Send email notification to admin
    if (resend) {
      try {
        const recipientEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || "contact@lume.studio";
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: `Yeni Sanatçı Başvurusu: ${name}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Yeni Sanatçı Başvurusu</h2>
            <div style="margin-top: 20px;">
              <p><strong>İsim:</strong> ${name}</p>
              <p><strong>Slug:</strong> ${slug}</p>
              <p><strong>Uzmanlık:</strong> ${specialty}</p>
              <p><strong>Biyografi:</strong> ${bio || "Belirtilmemiş"}</p>
              ${email ? `<p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>` : ""}
              ${instagram ? `<p><strong>Instagram:</strong> ${instagram}</p>` : ""}
              ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ""}
              <p><strong>Çalışma Sayısı:</strong> ${works.length}</p>
              <p><strong>Profil Resmi:</strong> ${profileImage ? "Evet" : "Hayır"}</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px;">Başvuruyu görüntülemek için admin paneline giriş yapın:</p>
              <p style="font-size: 12px; color: #666;">${process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.com"}/admin</p>
            </div>
          </div>
        `,
          text: `
Yeni Sanatçı Başvurusu

İsim: ${name}
Slug: ${slug}
Uzmanlık: ${specialty}
Biyografi: ${bio || "Belirtilmemiş"}
${email ? `E-posta: ${email}` : ""}
${instagram ? `Instagram: ${instagram}` : ""}
${phone ? `Telefon: ${phone}` : ""}
Çalışma Sayısı: ${works.length}
Profil Resmi: ${profileImage ? "Evet" : "Hayır"}

Başvuruyu görüntülemek için admin paneline giriş yapın.
        `.trim(),
        });
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the submission if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Başvurunuz alındı. İnceleme sonrasında size dönüş yapılacaktır.",
      submissionId,
    });
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: error?.message || "Başvuru oluşturulurken bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

