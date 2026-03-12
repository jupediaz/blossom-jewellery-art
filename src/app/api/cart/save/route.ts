import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

const cartItemSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  price: z.number().finite().min(0).max(10_000),
  quantity: z.number().int().min(1).max(99),
  image: z.string().max(500).optional().default(''),
  slug: z.string().min(1).max(200),
  variant: z.string().max(100).optional(),
})

const cartSaveSchema = z.object({
  items: z.array(cartItemSchema).max(20),
  sessionToken: z.string().max(200).optional(),
})

type CartItem = z.infer<typeof cartItemSchema>

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 30, windowSeconds: 60 })
  if (limited) return limited

  let items: CartItem[]
  let sessionToken: string | undefined

  try {
    const body = cartSaveSchema.parse(await req.json())
    items = body.items
    sessionToken = body.sessionToken
  } catch {
    return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
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
