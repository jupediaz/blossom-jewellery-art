import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const cart = await db.cartSession.findUnique({
    where: { sessionToken: token },
  })

  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
  }

  if (cart.convertedOrderId) {
    return NextResponse.json({ error: 'This cart has already been converted to an order' }, { status: 400 })
  }

  // Mark as recovered
  await db.cartSession.update({
    where: { id: cart.id },
    data: {
      recoveredAt: new Date(),
      lastActivityAt: new Date(),
      abandonedAt: null,
    },
  })

  return NextResponse.json({
    items: cart.items,
    subtotal: Number(cart.subtotal),
  })
}
