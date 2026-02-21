import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  slug: string
  variant?: string
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowSeconds: 60 })
  if (limited) return limited

  const { items, sessionToken } = (await req.json()) as {
    items: CartItem[]
    sessionToken?: string
  }

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: 'Items required' }, { status: 400 })
  }

  const session = await auth()
  const customerId = session?.user?.id || null

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // If cart is empty, remove the session
  if (items.length === 0) {
    if (sessionToken) {
      await db.cartSession.deleteMany({ where: { sessionToken } })
    } else if (customerId) {
      await db.cartSession.deleteMany({
        where: { customerId, convertedOrderId: null },
      })
    }
    return NextResponse.json({ sessionToken: null })
  }

  // Try to find existing cart session
  let cart = null

  if (sessionToken) {
    cart = await db.cartSession.findUnique({ where: { sessionToken } })
  }

  if (!cart && customerId) {
    cart = await db.cartSession.findFirst({
      where: { customerId, convertedOrderId: null },
      orderBy: { updatedAt: 'desc' },
    })
  }

  if (cart) {
    // Update existing
    await db.cartSession.update({
      where: { id: cart.id },
      data: {
        items: items as unknown as object[],
        subtotal,
        lastActivityAt: new Date(),
        abandonedAt: null, // Reset abandonment on activity
        customerId: customerId || cart.customerId,
      },
    })
    return NextResponse.json({ sessionToken: cart.sessionToken })
  }

  // Create new cart session
  const newCart = await db.cartSession.create({
    data: {
      items: items as unknown as object[],
      subtotal,
      customerId,
      lastActivityAt: new Date(),
    },
  })

  return NextResponse.json({ sessionToken: newCart.sessionToken })
}
