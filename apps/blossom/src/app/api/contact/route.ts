import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { contactMessageDb } from "@/lib/db";
import { siteConfig } from "@/lib/env";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(50),
  message: z.string().min(10).max(5000),
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const subjectMap: Record<string, string> = {
  general: "General Inquiry",
  custom: "Custom Order",
  wholesale: "Wholesale Inquiry",
  collaboration: "Collaboration",
  other: "Other",
};

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowSeconds: 3600 })
  if (limited) return limited

  let data: z.infer<typeof contactSchema>
  try {
    data = contactSchema.parse(await req.json());
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const safeName = escapeHtml(data.name)
  const safeEmail = escapeHtml(data.email)
  const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br>")
  const safeSubject = subjectMap[data.subject] || escapeHtml(data.subject)

  // Persist to DB first — don't lose the message if email fails
  try {
    await contactMessageDb.create({
      data: {
        name: data.name,
        email: data.email,
        subject: safeSubject,
        message: data.message,
      },
    })
  } catch (dbErr) {
    console.error('[Contact] Failed to persist message to DB:', dbErr)
    // Continue even if DB fails — still try to send email
  }

  try {
    await sendEmail({
      to: siteConfig.email,
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
  } catch (emailErr) {
    console.error('[Contact] Failed to send email:', emailErr)
    // Message is already in DB, so don't fail the request
  }

  return NextResponse.json({ success: true });
}
