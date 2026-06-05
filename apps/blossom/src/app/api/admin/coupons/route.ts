import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().nonnegative(),
  minOrderValue: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().default(1),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof couponSchema>
  try {
    body = couponSchema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const existing = await db.coupon.findUnique({ where: { code: body.code } })
  if (existing) {
    return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
  }

  const coupon = await db.coupon.create({
    data: {
      code: body.code,
      type: body.type,
      value: body.value,
      minOrderValue: body.minOrderValue,
      maxDiscountAmount: body.maxDiscountAmount,
      maxUses: body.maxUses,
      maxUsesPerCustomer: body.maxUsesPerCustomer,
      validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}
