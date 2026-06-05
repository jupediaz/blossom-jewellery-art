import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

function computeUnsubscribeToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? ''
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex')
}

const schema = z.object({
  subject: z.string().min(1).max(200),
  previewText: z.string().max(200).optional(),
  body: z.string().min(1).max(10000),
  locale: z.string().optional(), // empty = all locales
  preview: z.boolean().optional(), // dry-run: returns recipient count only
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'

function buildBroadcastHtml(subject: string, previewText: string, body: string) {
  // Convert newlines to <br> for simple plain-text bodies
  const htmlBody = body.replace(/\n\n/g, '</p><p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">').replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f2;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#2c2c2c;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#fff;letter-spacing:2px;">BLOSSOM BY OLHA</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 24px;font-size:24px;font-weight:400;color:#2c2c2c;line-height:1.3;">${subject}</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">${htmlBody}</p>
            <div style="margin-top:32px;text-align:center;">
              <a href="${BASE_URL}/products" style="display:inline-block;background:#2c2c2c;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:14px;letter-spacing:1px;">Shop Now</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#aaa;">You're receiving this because you subscribed to Blossom by Olha updates.</p>
            <p style="margin:0;font-size:12px;color:#aaa;"><a href="${BASE_URL}/api/newsletter/unsubscribe?email={{EMAIL}}&token={{TOKEN}}" style="color:#aaa;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { subject, previewText = '', body: emailBody, locale, preview } = parsed.data

  const where = {
    isActive: true,
    ...(locale ? { locale } : {}),
  }

  const subscribers = await db.newsletterSubscriber.findMany({
    where,
    select: { email: true },
  })

  // Dry-run: return count only
  if (preview) {
    return NextResponse.json({ count: subscribers.length })
  }

  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Send in batches of 50 with 200ms delay between batches to stay within Resend limits
  const BATCH_SIZE = 50
  let sent = 0
  let failed = 0
  const html = buildBroadcastHtml(subject, previewText, emailBody)

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (sub) => {
        const personalizedHtml = html
          .replace('{{EMAIL}}', encodeURIComponent(sub.email))
          .replace('{{TOKEN}}', computeUnsubscribeToken(sub.email))
        try {
          await sendEmail({
            to: sub.email,
            subject,
            html: personalizedHtml,
          })
          sent++
        } catch {
          failed++
        }
      })
    )
    // Small delay between batches
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }

  // Persist broadcast log (best-effort)
  db.newsletterBroadcast.create({
    data: {
      subject,
      previewText: previewText || null,
      locale: locale || null,
      sentTo: sent,
      failed,
      sentBy: session.user.email ?? null,
    },
  }).catch(() => {})

  return NextResponse.json({ sent, failed, total: subscribers.length })
}
