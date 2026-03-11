import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(50),
  message: z.string().min(10).max(5000),
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowSeconds: 3600 })
  if (limited) return limited

  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const subjectMap: Record<string, string> = {
      general: "General Inquiry",
      custom: "Custom Order",
      wholesale: "Wholesale Inquiry",
      collaboration: "Collaboration",
      other: "Other",
    };

    const safeName = escapeHtml(data.name)
    const safeEmail = escapeHtml(data.email)
    const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br>")
    const safeSubject = subjectMap[data.subject] || escapeHtml(data.subject)

    await sendEmail({
      to: "hello@blossombyolha.com",
      subject: `[${safeSubject}] from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
