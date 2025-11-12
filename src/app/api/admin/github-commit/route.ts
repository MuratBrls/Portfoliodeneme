import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

async function checkAuth(request: NextRequest): Promise<boolean> {
  // Check if this is an internal request (from same origin)
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const isInternal = referer?.includes(request.nextUrl.origin) || origin === request.nextUrl.origin;
  
  // For internal requests from admin routes, we trust them (they already checked auth)
  // For external requests, check cookie
  if (isInternal) {
    // Check if request has a special header indicating it's from an authenticated admin route
    const internalAuth = request.headers.get("x-internal-auth");
    if (internalAuth === "admin-authenticated") {
      return true;
    }
  }
  
  // Fallback to cookie check
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

interface GitHubCommitParams {
  filePath: string;
  content: string;
  message: string;
  branch?: string;
}

async function commitToGitHub(params: GitHubCommitParams): Promise<{ success: boolean; error?: string }> {
  const { filePath, content, message, branch = "main" } = params;

  const githubToken = process.env.GITHUB_TOKEN;
  const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
  const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";

  if (!githubToken) {
    return { success: false, error: "GITHUB_TOKEN environment variable is not set" };
  }

  try {
    // Get current file SHA (if exists)
    const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}?ref=${branch}`;
    const getFileRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let sha: string | undefined;
    if (getFileRes.ok) {
      const fileData = await getFileRes.json();
      sha = fileData.sha;
    }

    // Encode content to base64
    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    // Commit file
    const commitUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`;
    const commitRes = await fetch(commitUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        branch,
        ...(sha && { sha }),
      }),
    });

    if (!commitRes.ok) {
      const errorData = await commitRes.json();
      return {
        success: false,
        error: errorData.message || `GitHub API error: ${commitRes.statusText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to commit to GitHub",
    };
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filePath, message, content: providedContent } = body;

    if (!filePath || !message) {
      return NextResponse.json(
        { error: "filePath and message are required" },
        { status: 400 }
      );
    }

    let content: string;

    // If content is provided, use it; otherwise read from file system
    if (providedContent) {
      content = providedContent;
    } else {
      // Try to read from local file system (for local dev)
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        content = fs.readFileSync(fullPath, "utf-8");
      } else {
        // On Vercel, file doesn't exist, so we need to get it from GitHub first
        const githubToken = process.env.GITHUB_TOKEN;
        const githubOwner = process.env.GITHUB_OWNER || "MuratBrls";
        const githubRepo = process.env.GITHUB_REPO || "Portfoliodeneme";
        const branch = "main";

        if (!githubToken) {
          return NextResponse.json(
            { error: "GITHUB_TOKEN not set and file not found locally" },
            { status: 500 }
          );
        }

        // Get file from GitHub
        const getFileUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}?ref=${branch}`;
        const getFileRes = await fetch(getFileUrl, {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!getFileRes.ok) {
          // File doesn't exist on GitHub either, use empty content
          content = "{}";
        } else {
          const fileData = await getFileRes.json();
          content = Buffer.from(fileData.content, "base64").toString("utf-8");
        }
      }
    }

    // Commit to GitHub
    const result = await commitToGitHub({
      filePath,
      content,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to commit to GitHub" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error committing to GitHub:", error);
    return NextResponse.json(
      { error: error.message || "Failed to commit to GitHub" },
      { status: 500 }
    );
  }
}

