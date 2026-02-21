import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import Stripe from 'stripe'

// Generate order number: BLM-2026-0001
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `BLM-${year}-`

  const lastOrder = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  })

  if (!lastOrder) return `${prefix}0001`

  const lastNum = parseInt(lastOrder.orderNumber.replace(prefix, ''), 10)
  return `${prefix}${String(lastNum + 1).padStart(4, '0')}`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`Payment failed for intent ${paymentIntent.id}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
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
    console.error('Failed to parse order items from metadata')
    return
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

  const orderNumber = await generateOrderNumber()

  // Create order with items in a single transaction
  const order = await db.order.create({
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
    const inventory = await db.inventory.findFirst({
      where: { sanityProductId: item.id },
    })

    if (inventory && inventory.trackInventory) {
      await db.inventory.update({
        where: { id: inventory.id },
        data: {
          quantityReserved: { decrement: item.qty },
          quantitySold: { increment: item.qty },
        },
      })

      await db.stockMovement.create({
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

  // Increment coupon usage
  if (couponId) {
    await db.coupon.update({
      where: { id: couponId },
      data: { currentUses: { increment: 1 } },
    })
  }

  // Send confirmation email
  const customerEmail =
    session.customer_details?.email ||
    (customerId
      ? (await db.user.findUnique({ where: { id: customerId } }))?.email
      : null)

  if (customerEmail) {
    await sendEmail({
      to: customerEmail,
      subject: `Order Confirmed - ${orderNumber}`,
      html: buildOrderConfirmationEmail(order.orderNumber, items, {
        subtotal,
        shippingCost,
        discountAmount,
        total,
      }),
    })

    await db.emailLog.create({
      data: {
        to: customerEmail,
        type: 'ORDER_CONFIRMATION',
        subject: `Order Confirmed - ${orderNumber}`,
        metadata: { orderId: order.id },
      },
    })
  }

  console.log(`Order ${orderNumber} created successfully for session ${session.id}`)
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

  console.log(`Released inventory for expired session ${session.id}`)
}

function buildOrderConfirmationEmail(
  orderNumber: string,
  items: Array<{ name: string; qty: number; price: number }>,
  totals: { subtotal: number; shippingCost: number; discountAmount: number; total: number }
) {
  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">&euro;${(item.price * item.qty).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  return `
    <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a">
      <div style="text-align:center;padding:32px 0;border-bottom:2px solid #1a1a1a">
        <h1 style="font-size:24px;margin:0">Blossom Jewellery Art</h1>
        <p style="color:#666;margin:8px 0 0">Thank you for your order</p>
      </div>
      <div style="padding:24px 0">
        <p style="font-size:16px">Order <strong>${orderNumber}</strong> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="border-bottom:2px solid #1a1a1a">
              <th style="text-align:left;padding:8px 0">Item</th>
              <th style="text-align:center;padding:8px 0">Qty</th>
              <th style="text-align:right;padding:8px 0">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;padding:16px 0">
          <p style="margin:4px 0;color:#666">Subtotal: &euro;${totals.subtotal.toFixed(2)}</p>
          ${totals.discountAmount > 0 ? `<p style="margin:4px 0;color:#059669">Discount: -&euro;${totals.discountAmount.toFixed(2)}</p>` : ''}
          <p style="margin:4px 0;color:#666">Shipping: ${totals.shippingCost > 0 ? `&euro;${totals.shippingCost.toFixed(2)}` : 'Free'}</p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:bold">Total: &euro;${totals.total.toFixed(2)}</p>
        </div>
      </div>
      <div style="text-align:center;padding:24px 0;border-top:1px solid #eee;color:#999;font-size:12px">
        <p>Blossom Jewellery Art &mdash; Handcrafted polymer clay jewelry</p>
        <p>Marbella, Spain</p>
      </div>
    </div>
  `
}
