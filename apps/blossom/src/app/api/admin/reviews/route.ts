import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/reviews?status=pending|approved|all&page=1
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = 20

  const where =
    status === 'pending'
      ? { isApproved: false }
      : status === 'approved'
      ? { isApproved: true }
      : {}

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { email: true } } },
    }),
    db.review.count({ where }),
  ])

  return NextResponse.json({ reviews, total, pages: Math.ceil(total / limit) })
}
