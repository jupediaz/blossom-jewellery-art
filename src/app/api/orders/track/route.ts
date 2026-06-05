import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  orderNumber: z.string().min(1).max(50),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowSeconds: 60 })
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { orderNumber, email } = parsed.data

  const order = await db.order.findFirst({
    where: {
      orderNumber: { equals: orderNumber, mode: 'insensitive' },
      OR: [
        { guestEmail: { equals: email, mode: 'insensitive' } },
        { customer: { email: { equals: email, mode: 'insensitive' } } },
      ],
    },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      trackingNumber: true,
      carrier: true,
      createdAt: true,
      total: true,
      items: {
        select: { productName: true, variantName: true, quantity: true, unitPrice: true },
      },
    },
  })

  if (!order) {
    // Avoid leaking info about which part didn't match
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
