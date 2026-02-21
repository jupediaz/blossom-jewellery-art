import { NextResponse } from "next/server";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(),
  locale: z.string().min(2).max(5).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, locale } = subscribeSchema.parse(body);

    // Try to persist to database if available
    try {
      const { db } = await import("@/lib/db");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).newsletterSubscriber.upsert({
        where: { email },
        update: { locale: locale || "en", isActive: true },
        create: { email, locale: locale || "en" },
      });
    } catch {
      // Database not available yet — log subscription
      console.log(`[Newsletter] New subscriber: ${email} (locale: ${locale || "en"})`);
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
