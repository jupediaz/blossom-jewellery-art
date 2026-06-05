import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/returns?status=REQUESTED&page=1
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const PAGE_SIZE = 20

  const where = status && status !== 'all' ? { status: status as never } : {}

  const [returns, total] = await Promise.all([
    db.return.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            customer: { select: { name: true, email: true } },
            guestEmail: true,
            guestName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    db.return.count({ where }),
  ])

  return NextResponse.json({ returns, total, page, pages: Math.ceil(total / PAGE_SIZE) })
}
