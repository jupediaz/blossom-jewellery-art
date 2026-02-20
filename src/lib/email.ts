import { Resend } from 'resend'

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined
}

export const resend =
  globalForResend.resend ??
  new Resend(process.env.RESEND_API_KEY)

if (process.env.NODE_ENV !== 'production') globalForResend.resend = resend

const FROM_EMAIL = 'Blossom Jewellery <hello@blossomjewellery.art>'
const REPLY_TO = 'olha@blossomjewellery.art'

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = REPLY_TO,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email send')
    return null
  }

  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    replyTo,
  })

  return result
}
