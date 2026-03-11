import { NextRequest, NextResponse } from 'next/server'
import crypto, { timingSafeEqual } from 'crypto'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email address').max(254),
  token: z.string().min(1, 'Token is required').max(256),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

export async function POST(req: NextRequest) {
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

  const { email, token, password } = body

  try {
    // Hash the incoming token to compare against stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Find the verification token by identifier only — compare hash in constant time
    const verificationToken = await db.verificationToken.findFirst({
      where: { identifier: email },
    })

    // Timing-safe comparison to prevent token enumeration attacks
    let tokenValid = false
    if (verificationToken) {
      try {
        tokenValid = timingSafeEqual(
          Buffer.from(verificationToken.token, 'hex'),
          Buffer.from(hashedToken, 'hex')
        )
      } catch {
        // Buffer length mismatch — invalid token
      }
    }

    if (!verificationToken || !tokenValid) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    // Check expiration
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await db.verificationToken.deleteMany({
        where: { identifier: email, token: hashedToken },
      })
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await hash(password, 12)

    // Update the user's password
    await db.user.update({
      where: { email },
      data: { passwordHash },
    })

    // Delete the used token
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ResetPassword] Error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
