import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

const schema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(100).optional(),
  })
  .refine(
    (d) => {
      if (d.newPassword || d.currentPassword) {
        return !!(d.newPassword && d.currentPassword)
      }
      return true
    },
    { message: 'Current password required to set a new password', path: ['currentPassword'] }
  )

export async function PATCH(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowSeconds: 300 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { name, currentPassword, newPassword } = parsed.data

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updates: { name?: string; passwordHash?: string } = {}

    if (name !== undefined) {
      updates.name = name
    }

    if (currentPassword && newPassword) {
      if (!user.passwordHash) {
        return NextResponse.json(
          { error: 'Password change is not available for OAuth accounts' },
          { status: 400 }
        )
      }
      const valid = await compare(currentPassword, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      updates.passwordHash = await hash(newPassword, 12)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    await db.user.update({ where: { id: session.user.id }, data: updates })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
