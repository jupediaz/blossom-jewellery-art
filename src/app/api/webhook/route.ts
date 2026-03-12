import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import OrderConfirmation from '@/emails/order-confirmation'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutExpired(session)
      break
    }

    case 'charge.failed': {
      // charge.failed can fire after session creation — release any inventory reservations
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await handleChargeFailed(String(charge.payment_intent))
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handleChargeFailed(paymentIntent.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Idempotency: skip if order already exists for this session
  const existingOrder = await db.order.findUnique({
    where: { stripeSessionId: session.id },
  })
  if (existingOrder) return

  const meta = session.metadata || {}

  // Parse order items from metadata
  let items: Array<{
    id: string
    name: string
    price: number
    qty: number
    variant?: string
    image?: string
  }> = []

  try {
    items = JSON.parse(meta.order_items || '[]')
  } catch {
    // Throw so the outer try/catch returns 400, causing Stripe to retry
    throw new Error(`Failed to parse order_items metadata for session ${session.id}`)
  }

  const subtotal = parseFloat(meta.subtotal || '0')
  const discountAmount = parseFloat(meta.discount_amount || '0')
  const shippingCost = parseFloat(meta.shipping_cost || '0')
  const total = subtotal - discountAmount + shippingCost
  const customerId = meta.customer_id || null
  const couponId = meta.coupon_id || null
  const shippingMethodId = meta.shipping_method_id || null
  const customerNote = meta.customer_note || null

  // Extract shipping address from Stripe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionAny = session as any
  const stripeAddress = sessionAny.shipping_details?.address
  const shippingAddress = stripeAddress
    ? {
        name: sessionAny.shipping_details?.name || '',
        line1: stripeAddress.line1 || '',
        line2: stripeAddress.line2 || '',
        city: stripeAddress.city || '',
        state: stripeAddress.state || '',
        postalCode: stripeAddress.postal_code || '',
        country: stripeAddress.country || '',
      }
    : {}

  // Wrap order creation, inventory updates, and coupon usage in a transaction
  // P2002 = unique constraint violation: concurrent webhook retry for same session — safe to ignore
  let txResult: { order: Awaited<ReturnType<typeof db.order.create>>; orderNumber: string }
  try {
    txResult = await db.$transaction(async (tx) => {
    // Generate order number: BLM-2026-0001
    const year = new Date().getFullYear()
    const prefix = `BLM-${year}-`
    const lastOrder = await tx.order.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
    })
    const orderNumber = lastOrder
      ? `${prefix}${String(parseInt(lastOrder.orderNumber.replace(prefix, ''), 10) + 1).padStart(4, '0')}`
      : `${prefix}0001`

    // Create order with items
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: customerId || undefined,
        guestEmail: customerId ? undefined : session.customer_details?.email || undefined,
        guestName: customerId ? undefined : session.customer_details?.name || undefined,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        stripeSessionId: session.id,
        stripePaymentIntent: session.payment_intent as string,
        subtotal,
        shippingCost,
        discountAmount,
        total,
        couponId: couponId || undefined,
        shippingAddress,
        shippingMethodId: shippingMethodId || undefined,
        customerNote,
        items: {
          create: items.map((item) => ({
            sanityProductId: item.id,
            variantName: item.variant || null,
            productName: item.name,
            productImage: item.image || null,
            unitPrice: item.price,
            quantity: item.qty,
            totalPrice: item.price * item.qty,
          })),
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: 'Order placed' },
            { status: 'CONFIRMED', note: 'Payment confirmed via Stripe' },
          ],
        },
      },
    })

    // Convert reservations to sales
    for (const item of items) {
      const inventory = await tx.inventory.findFirst({
        where: { sanityProductId: item.id },
      })

      if (inventory && inventory.trackInventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantityReserved: { decrement: item.qty },
            quantitySold: { increment: item.qty },
          },
        })

        await tx.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: 'SALE',
            quantity: item.qty,
            reason: `Order ${orderNumber}`,
            orderId: order.id,
          },
        })
      }
    }

    // Increment coupon usage atomically — single SQL prevents race condition where two
    // concurrent checkouts both pass maxUses check and double-count the same coupon.
    if (couponId) {
      await tx.$executeRaw`
        UPDATE "Coupon"
        SET "currentUses" = "currentUses" + 1
        WHERE "id" = ${couponId}
          AND ("maxUses" IS NULL OR "currentUses" < "maxUses")
      `
    }

      return { order, orderNumber }
    })
  } catch (txError) {
    if ((txError as { code?: string }).code === 'P2002') return // race condition — already processed
    throw txError
  }
  const { order, orderNumber } = txResult

  // Send confirmation email
  const customerEmail =
    session.customer_details?.email ||
    (customerId
      ? (await db.user.findUnique({ where: { id: customerId } }))?.email
      : null)

  if (customerEmail) {
    try {
      const emailHtml = await render(
        OrderConfirmation({
          orderNumber,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.qty,
            unitPrice: i.price,
            totalPrice: i.price * i.qty,
            image: i.image,
            variant: i.variant,
          })),
          subtotal,
          shippingCost,
          discountAmount,
          total,
          shippingAddress: {
            name: shippingAddress.name || '',
            line1: shippingAddress.line1 || '',
            city: shippingAddress.city || '',
            postalCode: shippingAddress.postalCode || '',
            country: shippingAddress.country || '',
          },
        })
      )
      await sendEmail({
        to: customerEmail,
        subject: `Order Confirmed — ${orderNumber}`,
        html: emailHtml,
      })
      await db.emailLog.create({
        data: {
          to: customerEmail,
          type: 'ORDER_CONFIRMATION',
          subject: `Order Confirmed - ${orderNumber}`,
          metadata: { orderId: order.id },
        },
      })
    } catch (emailError) {
      console.error(`Failed to send/log order confirmation email for ${orderNumber}:`, emailError)
    }
  }
}

async function handleChargeFailed(paymentIntentId: string) {
  // Find any pending order for this payment intent and release its inventory reservations
  // (Orders are only created on checkout.session.completed, so this handles the rare case
  // where a charge fails before order creation or after a retry)
  const order = await db.order.findFirst({
    where: { stripePaymentIntent: paymentIntentId },
    include: { items: true },
  })

  if (order && order.paymentStatus === 'PENDING') {
    for (const item of order.items) {
      const inventory = await db.inventory.findFirst({
        where: { sanityProductId: item.sanityProductId },
      })
      if (inventory) {
        await db.inventory.update({
          where: { id: inventory.id },
          data: { quantityReserved: { decrement: item.quantity } },
        }).catch(() => {/* best-effort */})
      }
    }
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    }).catch(() => {/* best-effort */})
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {}

  // Release inventory reservations
  let reservations: string[] = []
  try {
    reservations = JSON.parse(meta.inventory_reservations || '[]')
  } catch {
    return
  }

  let items: Array<{ id: string; qty: number }> = []
  try {
    items = JSON.parse(meta.order_items || '[]')
  } catch {
    return
  }

  for (const item of items) {
    const inventory = await db.inventory.findFirst({
      where: { sanityProductId: item.id },
    })

    if (inventory && reservations.includes(inventory.id)) {
      await db.inventory.update({
        where: { id: inventory.id },
        data: { quantityReserved: { decrement: item.qty } },
      })

      await db.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          type: 'RELEASE',
          quantity: item.qty,
          reason: 'Checkout session expired',
        },
      })
    }
  }

  // Inventory released for expired session
}

