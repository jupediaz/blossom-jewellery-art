import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { render } from '@react-email/render'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import PasswordReset from '@/emails/password-reset'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 3, windowSeconds: 300 })
  if (limited) return limited

  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email } = body

  // Always return success to avoid leaking whether the email exists
  const successResponse = NextResponse.json({ success: true })

  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) return successResponse

    // Generate a random token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex')

    // Delete any existing reset tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Store the hashed token (expires in 1 hour)
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    // Build reset URL with the raw (unhashed) token
    const resetUrl = `${SITE_URL}/account/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`

    const html = await render(PasswordReset({ resetUrl }))

    await sendEmail({
      to: email,
      subject: 'Reset your password — Blossom by Olha',
      html,
    })
  } catch (error) {
    console.error('[ForgotPassword] Error:', error)
    // Still return success to avoid leaking info
  }

  return successResponse
}
