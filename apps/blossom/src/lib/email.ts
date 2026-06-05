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

const BASE_URL = 'https://www.blossombyolha.com'

export async function sendEmail({
  to,
  subject,
  html,
  replyTo = REPLY_TO,
  unsubscribeToken,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
  unsubscribeToken?: string
}) {
  if (!resend) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email send')
    return null
  }

  const headers: Record<string, string> = {}
  if (unsubscribeToken) {
    const url = `${BASE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(to)}&token=${unsubscribeToken}`
    headers['List-Unsubscribe'] = `<${url}>, <mailto:hello@blossombyolha.com?subject=unsubscribe>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo,
      ...(Object.keys(headers).length > 0 && { headers }),
    })

    if (result.error) {
      console.error('[Email] Resend API error:', result.error)
    }

    return result
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return { data: null, error }
  }
}
