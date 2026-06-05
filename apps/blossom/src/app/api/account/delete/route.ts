import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import AccountDeleted from '@/emails/account-deleted'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 3, windowSeconds: 3600 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const body = await req.json().catch(() => ({}))
  const { password, confirm } = body as { password?: string; confirm?: string }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, passwordHash: true, accounts: { select: { provider: true } } },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const hasPassword = !!user.passwordHash
  if (hasPassword) {
    // Credential account: require current password
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }
    const valid = await compare(password, user.passwordHash!)
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 400 })
    }
  } else {
    // OAuth account: require typing "DELETE" to confirm
    if (confirm !== 'DELETE') {
      return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 })
    }
  }

  const { name, email } = user

  // Anonymize orders (keep for business records) then delete account
  await db.$transaction([
    db.order.updateMany({
      where: { customerId: userId },
      data: { customerId: null },
    }),
    db.user.delete({ where: { id: userId } }),
  ])

  // Send goodbye email — non-blocking, fire-and-forget
  render(AccountDeleted({ name: name ?? undefined }))
    .then((html) =>
      sendEmail({
        to: email,
        subject: 'Your Blossom account has been deleted',
        html,
      })
    )
    .catch(() => {/* best-effort, account is already deleted */})

  return NextResponse.json({ success: true })
}
