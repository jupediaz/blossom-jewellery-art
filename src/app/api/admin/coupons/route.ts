import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

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
      maxUsesPerCustomer: body.maxUsesPerCustomer ?? 1,
      validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    },
  })

  return NextResponse.json(coupon, { status: 201 })
}
