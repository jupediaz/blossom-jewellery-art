import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/email'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const body = await req.json()
  const { amount, reason, items } = body as {
    amount: number        // in euros/dollars (the display amount)
    reason: string        // DUPLICATE | FRAUDULENT | REQUESTED_BY_CUSTOMER
    items?: string[]      // optional item IDs for partial refund context
  }

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 })
  }

  const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer']
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Invalid refund reason' }, { status: 400 })
  }

  // Fetch order with items and customer
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { email: true, name: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (!order.stripePaymentIntent) {
    return NextResponse.json(
      { error: 'No Stripe payment intent found for this order' },
      { status: 422 }
    )
  }

  if (order.status === 'REFUNDED') {
    return NextResponse.json(
      { error: 'Order has already been fully refunded' },
      { status: 422 }
    )
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const orderTotal = Number(order.total)
  const amountInCents = Math.round(amount * 100)
  const orderTotalInCents = Math.round(orderTotal * 100)
  const isPartial = amountInCents < orderTotalInCents

  // Validate refund amount doesn't exceed order total
  if (amountInCents > orderTotalInCents) {
    return NextResponse.json(
      { error: `Refund amount (${amount}) exceeds order total (${orderTotal})` },
      { status: 422 }
    )
  }

  // Create Stripe refund
  let stripeRefund
  try {
    stripeRefund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntent,
      amount: amountInCents,
      reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
    })
  } catch (stripeError) {
    console.error('[Refund] Stripe error:', stripeError)
    const message =
      stripeError instanceof Error ? stripeError.message : 'Stripe refund failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // OrderStatus uses REFUNDED for both full and partial — partial tracked via PaymentStatus
  const newStatus = 'REFUNDED' as const
  const newPaymentStatus = isPartial ? 'PARTIALLY_REFUNDED' : 'REFUNDED'

  const statusNote = isPartial
    ? `Partial refund of ${order.currency} ${amount.toFixed(2)} processed. Stripe refund ID: ${stripeRefund.id}`
    : `Full refund of ${order.currency} ${amount.toFixed(2)} processed. Stripe refund ID: ${stripeRefund.id}`

  // Validate that all provided item IDs belong to this order
  if (items && items.length > 0) {
    const orderItemIds = new Set(order.items.map((i) => i.id))
    const invalidIds = items.filter((itemId) => !orderItemIds.has(itemId))
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Item IDs do not belong to this order: ${invalidIds.join(', ')}` },
        { status: 400 }
      )
    }
  }

  // Determine which items to release inventory for
  const itemsToRelease = items && items.length > 0
    ? order.items.filter((item) => items.includes(item.id))
    : isPartial
    ? []  // partial refund without item selection: skip inventory adjustment
    : order.items

  // Persist refund, update order status, release inventory — all in one transaction
  await db.$transaction(async (tx) => {
    // 1. Create Refund record
    await tx.refund.create({
      data: {
        orderId: id,
        stripeRefundId: stripeRefund.id,
        amount: amountInCents,
        reason,
        status: stripeRefund.status ?? 'succeeded',
      },
    })

    // 2. Update order status and payment status
    await tx.order.update({
      where: { id },
      data: {
        status: newStatus,
        paymentStatus: newPaymentStatus,
      },
    })

    // 3. Append status history entry
    await tx.orderStatusHistory.create({
      data: {
        orderId: id,
        status: newStatus,
        note: statusNote,
      },
    })

    // 4. Release inventory for refunded items
    for (const item of itemsToRelease) {
      const inventory = await tx.inventory.findFirst({
        where: {
          sanityProductId: item.sanityProductId,
          ...(item.variantName ? { sanityVariantKey: item.variantName } : {}),
        },
      })

      if (inventory) {
        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            quantityReserved: { decrement: Math.min(item.quantity, inventory.quantityReserved) },
            quantitySold: { decrement: Math.min(item.quantity, inventory.quantitySold) },
          },
        })

        await tx.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: 'RETURN',
            quantity: item.quantity,
            reason: `Refund: ${reason} — order ${order.orderNumber}`,
            orderId: id,
          },
        })
      }
    }
  })

  // Send refund confirmation email (fire-and-forget, don't fail the response)
  const customerEmail = order.customer?.email || order.guestEmail
  if (customerEmail) {
    try {
      const customerName = order.customer?.name || order.guestName || 'there'
      const formattedAmount = `${order.currency} ${amount.toFixed(2)}`
      const reasonLabel: Record<string, string> = {
        duplicate: 'Duplicate order',
        fraudulent: 'Fraudulent transaction',
        requested_by_customer: 'Customer request',
      }

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
    <h1 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px;">Refund Confirmed</h1>
    <p style="color: #666; font-size: 14px; margin: 0 0 32px;">Hi ${customerName}, your refund has been processed.</p>

    <div style="background: #f4f4f4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #666; font-size: 14px;">Order</span>
        <span style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${order.orderNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #666; font-size: 14px;">Refund Amount</span>
        <span style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${formattedAmount}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color: #666; font-size: 14px;">Reason</span>
        <span style="color: #1a1a1a; font-size: 14px;">${reasonLabel[reason] || reason}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #666; font-size: 14px;">Refund ID</span>
        <span style="color: #999; font-size: 12px; font-family: monospace;">${stripeRefund.id}</span>
      </div>
    </div>

    <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0 0 24px;">
      The refund has been submitted to your original payment method. Depending on your bank, it may take
      <strong>5–10 business days</strong> to appear on your statement.
    </p>

    <p style="color: #999; font-size: 12px; margin: 0;">
      Questions? Reply to this email or contact us at <a href="mailto:hello@blossombyolha.com" style="color: #4a4a4a;">hello@blossombyolha.com</a>
    </p>
  </div>
</body>
</html>`

      await sendEmail({
        to: customerEmail,
        subject: `Refund confirmed for order ${order.orderNumber}`,
        html,
      })

      await db.emailLog.create({
        data: {
          to: customerEmail,
          type: 'REFUND_CONFIRMATION',
          subject: `Refund confirmed for order ${order.orderNumber}`,
          status: 'sent',
          metadata: { orderId: id, refundId: stripeRefund.id, amount: amountInCents },
        },
      })
    } catch (emailError) {
      console.error('[Refund] Failed to send confirmation email:', emailError)
    }
  }

  return NextResponse.json({
    success: true,
    refundId: stripeRefund.id,
    status: stripeRefund.status,
    amount: amountInCents,
    orderStatus: newStatus,
    paymentStatus: newPaymentStatus,
  })
}
