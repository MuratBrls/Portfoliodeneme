import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeString, validateEmail } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 submissions per hour
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`contact-form-${clientIP}`, 10, 60 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const nameRaw = body.name;
    const emailRaw = body.email;
    const projectRaw = body.project;

    if (!nameRaw || !emailRaw) {
      return NextResponse.json({ error: "Ad ve e-posta zorunludur" }, { status: 400 });
    }

    // Sanitize and validate inputs
    const name = sanitizeString(nameRaw, 200);
    const email = emailRaw.trim().toLowerCase();
    const project = sanitizeString(projectRaw || "", 2000);

    if (name.length === 0) {
      return NextResponse.json({ error: "Geçerli bir ad giriniz" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz" }, { status: 400 });
    }

    // Here you would typically send an email or save to a database
    // For now, we'll just log it and return success
    console.log("Contact form submission:", { name, email, project: project.substring(0, 100) });

    // TODO: Integrate with email service (e.g., SendGrid, Resend, etc.)
    // TODO: Or save to database

    return NextResponse.json({ success: true, message: "Mesajınız alındı. En kısa sürede dönüş yapacağız." });
  } catch (error) {
    console.error("Contact form error:", error);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      { error: isProduction ? "Bir hata oluştu. Lütfen tekrar deneyin." : "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

