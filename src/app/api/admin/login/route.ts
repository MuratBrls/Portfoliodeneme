import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { validateAdminPassword } from "@/lib/security";

// Load password from environment - Next.js automatically loads .env.local in development
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Debug: Log the loaded password on server start (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("=== ADMIN PASSWORD LOADED ===");
  console.log("ADMIN_PASSWORD from env:", process.env.ADMIN_PASSWORD ? "SET" : "NOT SET");
  console.log("ADMIN_PASSWORD value:", ADMIN_PASSWORD);
  console.log("ADMIN_PASSWORD length:", ADMIN_PASSWORD.length);
  console.log("=============================");
}

// Validate admin password on module load in production
if (process.env.NODE_ENV === "production") {
  const validation = validateAdminPassword();
  if (!validation.valid) {
    console.error("SECURITY WARNING:", validation.error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get password from environment at runtime
    const runtimePassword = process.env.ADMIN_PASSWORD || "admin123";
    
    if (!runtimePassword || runtimePassword === "admin123") {
      console.warn("WARNING: Using default password. Set ADMIN_PASSWORD in .env.local");
    }
    
    // Rate limiting: 5 attempts per 15 minutes
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`admin-login-${clientIP}`, 5, 15 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Compare passwords - trim both to handle any whitespace issues
    const providedPassword = password.trim();
    const expectedPassword = runtimePassword.trim();
    
    // Simple and secure password comparison
    const isValid = expectedPassword === providedPassword;

    if (isValid) {
      const cookieStore = await cookies();
      // Session-based cookie: expires when browser closes (no maxAge)
      cookieStore.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        // No maxAge = session cookie (expires when browser closes)
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
  return NextResponse.json({ success: true });
}

