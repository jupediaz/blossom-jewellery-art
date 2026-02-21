import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowSeconds: 60 })
  if (limited) return limited

  const { code, subtotal, customerId, productIds, collectionIds } = await req.json()

  if (!code) {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
  }

  const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })

  if (!coupon) {
    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  }

  // Check active
  if (!coupon.isActive) {
    return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
  }

  // Check date validity
  const now = new Date()
  if (coupon.validFrom > now) {
    return NextResponse.json({ error: 'This coupon is not yet valid' }, { status: 400 })
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
  }

  // Check global usage limit
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
  }

  // Check per-customer usage limit
  if (customerId && coupon.maxUsesPerCustomer > 0) {
    const customerUses = await db.order.count({
      where: {
        customerId,
        couponId: coupon.id,
        paymentStatus: { in: ['PAID', 'PARTIALLY_REFUNDED'] },
      },
    })
    if (customerUses >= coupon.maxUsesPerCustomer) {
      return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 })
    }
  }

  // Check minimum order value
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return NextResponse.json({
      error: `Minimum order of €${Number(coupon.minOrderValue).toFixed(2)} required`,
    }, { status: 400 })
  }

  // Check product/collection applicability
  const hasProductScope = coupon.applicableProducts.length > 0
  const hasCollectionScope = coupon.applicableCollections.length > 0

  if (hasProductScope || hasCollectionScope) {
    const productMatch = hasProductScope && productIds?.some((id: string) =>
      coupon.applicableProducts.includes(id)
    )
    const collectionMatch = hasCollectionScope && collectionIds?.some((id: string) =>
      coupon.applicableCollections.includes(id)
    )

    if (!productMatch && !collectionMatch) {
      return NextResponse.json({
        error: 'This coupon does not apply to your cart items',
      }, { status: 400 })
    }
  }

  // Calculate discount
  let discountAmount = 0

  if (coupon.type === 'PERCENTAGE') {
    discountAmount = subtotal * (Number(coupon.value) / 100)
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
    }
  } else if (coupon.type === 'FIXED_AMOUNT') {
    discountAmount = Math.min(Number(coupon.value), subtotal)
  }
  // FREE_SHIPPING doesn't reduce subtotal — handled at checkout level

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discountAmount: Math.round(discountAmount * 100) / 100,
    freeShipping: coupon.type === 'FREE_SHIPPING',
  })
}
