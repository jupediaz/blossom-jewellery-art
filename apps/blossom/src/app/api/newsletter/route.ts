import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHmac } from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import NewsletterWelcome from "@/emails/newsletter-welcome";

function buildUnsubToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex");
}

const subscribeSchema = z.object({
  email: z.string().email(),
  locale: z.string().min(2).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 3, windowSeconds: 3600 })
  if (limited) return limited

  try {
    const body = await req.json();
    const { email, locale } = subscribeSchema.parse(body);

    let isNew = true;

    // Try to persist to database if available
    try {
      const { newsletterDb } = await import("@/lib/db");
      const result = await newsletterDb.upsert({
        where: { email },
        update: { locale: locale || "en", isActive: true },
        create: { email, locale: locale || "en" },
      });
      // If updatedAt is very close to createdAt, it's a new subscriber
      isNew = Math.abs(result.updatedAt.getTime() - result.createdAt.getTime()) < 1000;
    } catch {
      // Database not available yet — subscription acknowledged without persistence
    }

    // Send welcome email to new subscribers only
    if (isNew) {
      try {
        const html = await render(NewsletterWelcome({ email, locale: locale || "en" }));
        await sendEmail({
          to: email,
          subject: "Welcome to Blossom by Olha 🌸",
          html,
          unsubscribeToken: buildUnsubToken(email),
        });
      } catch (err) {
        console.error("[Newsletter] Failed to send welcome email:", err);
        // Non-blocking — subscription still succeeds
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
