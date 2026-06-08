import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { render } from '@react-email/render'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import PasswordReset from '@/emails/password-reset'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const user = await db.user.findUnique({ where: { id, role: 'CUSTOMER' } })
    if (!user) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'This customer uses social login and has no password to reset' },
        { status: 400 }
      )
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    await db.verificationToken.deleteMany({ where: { identifier: user.email } })
    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h for admin-initiated
      },
    })

    const resetUrl = `${SITE_URL}/account/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`
    const html = await render(PasswordReset({ resetUrl }))

    await sendEmail({
      to: user.email,
      subject: 'Reset your Blossom by Olha password',
      html,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
  }
}
