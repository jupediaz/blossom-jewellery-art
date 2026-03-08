import { Resend } from 'resend'

const globalForResend = globalThis as unknown as {
  resend: Resend | null | undefined
}

function createResendClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export const resend = globalForResend.resend ?? createResendClient()

if (process.env.NODE_ENV !== 'production') globalForResend.resend = resend

const FROM_EMAIL = 'Blossom by Olha <hello@blossombyolha.com>'
const REPLY_TO = 'olha@blossombyolha.com'

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
  if (!resend) {
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
