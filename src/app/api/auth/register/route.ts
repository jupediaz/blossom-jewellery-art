import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import Welcome from '@/emails/welcome'
import { z } from 'zod'

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

  // Send welcome email (fire-and-forget, don't block registration)
  try {
    const html = await render(Welcome({ name: name || 'there' }))
    await sendEmail({
      to: email,
      subject: 'Welcome to Blossom by Olha',
      html,
    })
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
