import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

function computeToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(email.toLowerCase()).digest("hex");
}

export function generateUnsubscribeToken(email: string): string {
  return computeToken(email);
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const token = req.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  const expected = computeToken(email);
  // Use timing-safe comparison to prevent timing attacks
  let valid = false
  try {
    valid = timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    // Buffer lengths differ — invalid token
  }
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired unsubscribe link" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase() },
      data: { isActive: false },
    });
  } catch {
    // DB unavailable — unsubscribe acknowledged without persistence
  }

  // Redirect to confirmation page
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const prefix = locale === "en" ? "" : `/${locale}`;
  return NextResponse.redirect(new URL(`${prefix}/newsletter/unsubscribed`, req.url));
}
