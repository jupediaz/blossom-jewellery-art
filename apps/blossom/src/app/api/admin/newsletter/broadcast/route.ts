import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import {
  emailButton,
  emailHeading,
  emailShell,
  esc,
} from '@/lib/email-shell'
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
  // Admin-authored plain text: escaped first, then blank lines become
  // paragraphs and single newlines <br>. Every paragraph carries its own color
  // so nothing depends on inherited text color (see src/emails/theme.ts).
  const paragraph = 'margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;'
  const htmlBody = esc(body)
    .replace(/\n\n/g, `</p><p style="${paragraph}">`)
    .replace(/\n/g, '<br>')

  return emailShell(
    [
      emailHeading(subject),
      `<p style="${paragraph}">${htmlBody}</p>`,
      `<div style="margin-top:32px;text-align:center;">${emailButton(`${BASE_URL}/products`, 'Shop Now')}</div>`,
    ].join('\n'),
    {
      preheader: previewText,
      footerHtml: `<p style="margin:0 0 8px;font-size:12px;">You're receiving this because you subscribed to Blossom by Olha updates.</p>
            <p style="margin:0 0 8px;font-size:12px;"><a href="${BASE_URL}/api/newsletter/unsubscribe?email={{EMAIL}}&amp;token={{TOKEN}}" style="color:#999999;">Unsubscribe</a></p>`,
    },
  )
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
