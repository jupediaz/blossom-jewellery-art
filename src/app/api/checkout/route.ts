import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
}

interface CheckoutBody {
  items: CheckoutItem[]
  couponCode?: string
  shippingMethodId?: string
  countryCode?: string
  customerNote?: string
  locale?: string
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 10, windowSeconds: 60 })
  if (limited) return limited

  try {
    const body = (await request.json()) as CheckoutBody
    const { items, couponCode, shippingMethodId, countryCode, customerNote, locale } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    // Get authenticated user if available
    const session = await auth()
    const customerId = session?.user?.id

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Validate and apply coupon
    let couponId: string | null = null
    let discountAmount = 0
    let freeShipping = false

    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })

      if (coupon && coupon.isActive) {
        const now = new Date()
        const isValid =
          coupon.validFrom <= now &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.currentUses < coupon.maxUses)

        if (isValid) {
          couponId = coupon.id
          if (coupon.type === 'PERCENTAGE') {
            discountAmount = subtotal * (Number(coupon.value) / 100)
            if (coupon.maxDiscountAmount) {
              discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount))
            }
          } else if (coupon.type === 'FIXED_AMOUNT') {
            discountAmount = Math.min(Number(coupon.value), subtotal)
          } else if (coupon.type === 'FREE_SHIPPING') {
            freeShipping = true
          }
        }
      }
    }

    // Calculate shipping
    let shippingCost = 0
    let shippingMethodName = ''

    if (shippingMethodId) {
      const method = await db.shippingMethod.findUnique({
        where: { id: shippingMethodId },
        include: { zone: true },
      })

      if (method && method.isActive) {
        // Check free shipping from zone threshold
        const qualifiesForZoneFreeShipping =
          method.zone.freeShippingThreshold &&
          subtotal >= Number(method.zone.freeShippingThreshold)

        shippingCost = freeShipping || qualifiesForZoneFreeShipping
          ? 0
          : Number(method.rate)
        shippingMethodName = method.name
      }
    }

    // Reserve inventory for each item
    const inventoryReservations: string[] = []
    for (const item of items) {
      const inventory = await db.inventory.findFirst({
        where: { sanityProductId: item.id },
      })

      if (inventory && inventory.trackInventory) {
        const available =
          inventory.quantityTotal - inventory.quantityReserved - inventory.quantitySold
        if (available < item.quantity) {
          // Release any reservations we already made
          for (const resId of inventoryReservations) {
            await db.inventory.update({
              where: { id: resId },
              data: { quantityReserved: { decrement: item.quantity } },
            })
          }
          return NextResponse.json(
            { error: `"${item.name}" is out of stock` },
            { status: 400 }
          )
        }

        await db.inventory.update({
          where: { id: inventory.id },
          data: { quantityReserved: { increment: item.quantity } },
        })

        await db.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: 'RESERVATION',
            quantity: item.quantity,
            reason: 'Checkout reservation',
          },
        })

        inventoryReservations.push(inventory.id)
      }
    }

    // Build Stripe line items
    const total = subtotal - discountAmount + shippingCost
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.variant ? `${item.name} — ${item.variant}` : item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Discount is applied as a Stripe coupon below (not as a line item)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8525'
    // Build locale prefix for redirect URLs (empty for default 'en' with as-needed)
    const localePrefix = locale && locale !== 'en' ? `/${locale}` : ''

    // Build Stripe session with full metadata
    const stripeSessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: countryCode
          ? [countryCode as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry]
          : ['ES', 'DE', 'FR', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE', 'PL', 'CZ', 'SE', 'DK', 'FI', 'GB', 'US'],
      },
      success_url: `${siteUrl}${localePrefix}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${localePrefix}/cart`,
      metadata: {
        order_items: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            qty: i.quantity,
            variant: i.variant,
            image: i.image,
          }))
        ),
        coupon_id: couponId || '',
        coupon_code: couponCode?.toUpperCase() || '',
        discount_amount: String(discountAmount),
        shipping_method_id: shippingMethodId || '',
        shipping_method_name: shippingMethodName,
        shipping_cost: String(shippingCost),
        customer_id: customerId || '',
        customer_note: customerNote || '',
        subtotal: String(subtotal),
        total: String(total),
        inventory_reservations: JSON.stringify(inventoryReservations),
      },
    }

    // Add shipping as a separate line if there's a cost
    if (shippingCost > 0) {
      stripeSessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shippingCost * 100), currency: 'eur' },
            display_name: shippingMethodName || 'Shipping',
          },
        },
      ]
    } else if (shippingMethodId) {
      stripeSessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: `${shippingMethodName} (Free)`,
          },
        },
      ]
    }

    // Add discount as coupon in Stripe
    if (discountAmount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: 'eur',
        duration: 'once',
        name: couponCode?.toUpperCase() || 'Discount',
      })
      stripeSessionParams.discounts = [{ coupon: stripeCoupon.id }]
    }

    if (customerId) {
      stripeSessionParams.customer_email = session?.user?.email || undefined
    }

    const stripeSession = await stripe.checkout.sessions.create(stripeSessionParams)

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
