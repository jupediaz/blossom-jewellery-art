import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const RETURN_WINDOW_DAYS = 30

const createSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(['WRONG_ITEM', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER']),
  details: z.string().max(1000).optional(),
})

// GET /api/account/returns — list customer's own returns
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const returns = await db.return.findMany({
    where: { customerId: session.user.id },
    include: { order: { select: { orderNumber: true, total: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ returns })
}

// POST /api/account/returns — open a new return request
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { orderId, reason, details } = parsed.data

  // Verify order belongs to this customer and is eligible
  const order = await db.order.findFirst({
    where: { id: orderId, customerId: session.user.id },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'DELIVERED') {
    return NextResponse.json({ error: 'Only delivered orders can be returned' }, { status: 400 })
  }

  const windowEnd = new Date(order.createdAt)
  windowEnd.setDate(windowEnd.getDate() + RETURN_WINDOW_DAYS)
  if (new Date() > windowEnd) {
    return NextResponse.json({ error: `Return window of ${RETURN_WINDOW_DAYS} days has passed` }, { status: 400 })
  }

  // Check no existing open return for this order
  const existing = await db.return.findFirst({
    where: { orderId, status: { in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED'] } },
  })
  if (existing) {
    return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 })
  }

  const returnRequest = await db.return.create({
    data: {
      orderId,
      customerId: session.user.id,
      reason,
      details: details || null,
      status: 'REQUESTED',
    },
  })

  return NextResponse.json({ return: returnRequest }, { status: 201 })
}
