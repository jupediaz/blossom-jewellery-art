import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

// Public endpoint — session_id is a Stripe-generated unguessable token,
// so it acts as a bearer credential for this particular order lookup.
export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowSeconds: 60 })
  if (limited) return limited

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  const order = await db.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: {
      orderNumber: true,
      status: true,
      subtotal: true,
      shippingCost: true,
      discountAmount: true,
      total: true,
      couponId: true,
      items: {
        select: {
          id: true,
          productName: true,
          variantName: true,
          productImage: true,
          unitPrice: true,
          quantity: true,
          totalPrice: true,
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ found: false }, { status: 202 })
  }

  return NextResponse.json({ found: true, order })
}
