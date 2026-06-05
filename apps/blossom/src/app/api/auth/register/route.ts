import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import Welcome from '@/emails/welcome'
import EmailVerification from '@/emails/email-verification'
import { z } from 'zod'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'

const registerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowSeconds: 300 })
  if (limited) return limited

  let body: z.infer<typeof registerSchema>
  try {
    body = registerSchema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, email, password } = body

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
  }

  const passwordHash = await hash(password, 12)

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
    },
  })

  // Generate email verification token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  try {
    await db.verificationToken.create({
      data: {
        identifier: `verify:${email}`,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    })

    const verifyUrl = `${SITE_URL}/account/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`
    const html = await render(EmailVerification({ verifyUrl, name: name || 'there' }))
    await sendEmail({
      to: email,
      subject: 'Verify your email — Blossom by Olha',
      html,
    })
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    // Send welcome email as fallback
    try {
      const html = await render(Welcome({ name: name || 'there' }))
      await sendEmail({ to: email, subject: 'Welcome to Blossom by Olha', html })
    } catch { /* best-effort */ }
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
