import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { sanitizeString, validateEmail } from "@/lib/security";

// Initialize Resend only if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    // Get recipient email from environment (default to a placeholder if not set)
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || "contact@lume.studio";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Send email to LUME
    if (resend) {
      try {
        await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        replyTo: email,
        subject: `Yeni İletişim Formu: ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Yeni İletişim Formu Mesajı</h2>
            <div style="margin-top: 20px;">
              <p><strong>Gönderen:</strong> ${name}</p>
              <p><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
              ${project ? `<div style="margin-top: 20px;"><strong>Proje Detayları:</strong><p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">${project}</p></div>` : ''}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p>Bu mesaj LUME web sitesi iletişim formundan gönderilmiştir.</p>
            </div>
          </div>
        `,
        text: `
Yeni İletişim Formu Mesajı

Gönderen: ${name}
E-posta: ${email}
${project ? `\nProje Detayları:\n${project}` : ''}

---
Bu mesaj LUME web sitesi iletişim formundan gönderilmiştir.
        `.trim(),
      });

        // Send confirmation email to user
        await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Mesajınız Alındı - LUME",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">Mesajınız Alındı</h2>
            <div style="margin-top: 20px;">
              <p>Merhaba ${name},</p>
              <p>Mesajınızı aldık. En kısa sürede size dönüş yapacağız.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">LUME Studio</p>
            </div>
          </div>
        `,
        text: `
Mesajınız Alındı

Merhaba ${name},

Mesajınızı aldık. En kısa sürede size dönüş yapacağız.

LUME Studio
        `.trim(),
        });
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error("Email sending error:", emailError);
        // Log the submission even if email fails
        console.log("Contact form submission (email failed):", { name, email, project: project.substring(0, 100) });
      }
    } else {
      // If no API key, just log the submission
      console.log("Contact form submission (email not sent - no RESEND_API_KEY):", { name, email, project: project.substring(0, 100) });
    }

    return NextResponse.json({ success: true, message: "Mesajınız alındı. En kısa sürede size dönüş yapacağız." });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}

