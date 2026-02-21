import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowSeconds: 300 })
  if (limited) return limited

  const { name, email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

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

  return NextResponse.json({ success: true }, { status: 201 })
}
