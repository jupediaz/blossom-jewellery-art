import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { sanityFetch } from '@/lib/sanity/client'
import { mockProducts } from '@/lib/mock-data'

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

    if (items.length > 20) {
      return NextResponse.json({ error: 'Too many items in cart' }, { status: 400 })
    }

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return NextResponse.json(
          { error: `Invalid quantity for "${item.name}". Must be between 1 and 99.` },
          { status: 400 }
        )
      }
    }

    // Reject duplicate product IDs — cart should merge quantities before checkout
    const seen = new Set<string>()
    for (const item of items) {
      if (seen.has(item.id)) {
        return NextResponse.json(
          { error: `Duplicate product in cart: "${item.name}"` },
          { status: 400 }
        )
      }
      seen.add(item.id)
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    // Validate prices server-side — never trust client-supplied prices
    const productIds = items.map((i) => i.id)
    let serverPrices: Record<string, { price: number; name: string; inStock: boolean }> = {}

    try {
      type PriceResult = { _id: string; name: string; price: number; inStock: boolean }
      const sanityPrices = await sanityFetch<PriceResult[]>(
        `*[_type == "product" && _id in $ids]{ _id, name, price, inStock }`,
        { ids: productIds }
      )
      for (const p of sanityPrices) {
        serverPrices[p._id] = { price: p.price, name: p.name, inStock: p.inStock }
      }
    } catch {
      // Sanity unavailable — fall back to mock prices
      for (const mock of mockProducts) {
        if (productIds.includes(mock._id)) {
          serverPrices[mock._id] = { price: mock.price, name: mock.name, inStock: mock.inStock ?? true }
        }
      }
    }

    // Override client prices with verified server prices
    const validatedItems = items.map((item) => {
      const server = serverPrices[item.id]
      if (!server) {
        // Product doesn't exist — reject checkout
        throw Object.assign(new Error(`Product not found: ${item.name}`), { status: 400 })
      }
      return { ...item, name: server.name, price: server.price }
    })

    // Get authenticated user if available
    const session = await auth()
    const customerId = session?.user?.id

    // Fetch active offers for potential item-level discounts
    const now = new Date()
    let activeOffers: Array<{
      id: string
      discountType: string
      discountValue: number
      applyToAll: boolean
      applicableProducts: string[]
      applicableCollections: string[]
    }> = []
    try {
      activeOffers = await db.offer.findMany({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
        orderBy: { discountValue: 'desc' },
      }).then((rows) =>
        rows.map((r) => ({
          id: r.id,
          discountType: r.discountType,
          discountValue: Number(r.discountValue),
          applyToAll: r.applyToAll,
          applicableProducts: r.applicableProducts,
          applicableCollections: r.applicableCollections,
        }))
      )
    } catch {
      // DB unavailable — proceed without offer discounts
    }

    // Helper: find best active offer for an item id
    function getOfferForItem(itemId: string): (typeof activeOffers)[number] | null {
      for (const offer of activeOffers) {
        if (
          offer.applyToAll ||
          offer.applicableProducts.includes(itemId)
        ) {
          return offer
        }
      }
      return null
    }

    // Apply offer discounts to item prices before calculating subtotal
    const itemsWithOffers = validatedItems.map((item) => {
      const offer = getOfferForItem(item.id)
      if (!offer) return { ...item, offerDiscountedPrice: null }
      const discounted =
        offer.discountType === 'PERCENTAGE'
          ? item.price * (1 - offer.discountValue / 100)
          : Math.max(0, item.price - offer.discountValue)
      return { ...item, offerDiscountedPrice: discounted }
    })

    // Calculate subtotal
    const subtotal = itemsWithOffers.reduce(
      (sum, item) => sum + (item.offerDiscountedPrice ?? item.price) * item.quantity,
      0
    )

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
    const inventoryReservations: Array<{ id: string; qty: number }> = []
    for (const item of validatedItems) {
      const inventory = await db.inventory.findFirst({
        where: { sanityProductId: item.id },
      })

      if (inventory && inventory.trackInventory) {
        const available =
          inventory.quantityTotal - inventory.quantityReserved - inventory.quantitySold
        if (available < item.quantity) {
          // Release any reservations we already made (using each reservation's own qty)
          for (const res of inventoryReservations) {
            await db.inventory.update({
              where: { id: res.id },
              data: { quantityReserved: { decrement: res.qty } },
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

        inventoryReservations.push({ id: inventory.id, qty: item.quantity })
      }
    }

    // Build Stripe line items (use offer-discounted price when available)
    const total = subtotal - discountAmount + shippingCost
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = itemsWithOffers.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.variant ? `${item.name} — ${item.variant}` : item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round((item.offerDiscountedPrice ?? item.price) * 100),
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
          itemsWithOffers.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.offerDiscountedPrice ?? i.price,
            qty: i.quantity,
            variant: i.variant,
            image: i.image,
          }))
        ),
        offer_ids: JSON.stringify(
          itemsWithOffers.map((i) => getOfferForItem(i.id)?.id ?? null)
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
        inventory_reservations: JSON.stringify(inventoryReservations.map(r => r.id)),
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

    let stripeSession: Stripe.Checkout.Session
    try {
      stripeSession = await stripe.checkout.sessions.create(stripeSessionParams)
    } catch (stripeError) {
      // Stripe failed — release all inventory reservations to avoid deadlock
      for (const res of inventoryReservations) {
        await db.inventory.update({
          where: { id: res.id },
          data: { quantityReserved: { decrement: res.qty } },
        }).catch(() => {/* best-effort release */})
      }
      console.error('Stripe session creation failed:', stripeError)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 400) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      )
    }
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
