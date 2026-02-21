import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import ShippingNotification from '@/emails/shipping-notification'
import DeliveryConfirmation from '@/emails/delivery-confirmation'
import type { OrderStatus } from '@/generated/prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, note, trackingNumber, carrier } = body as {
    status: OrderStatus
    note?: string
    trackingNumber?: string
    carrier?: string
  }

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { email: true, name: true } },
      shippingMethod: { include: { zone: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = { status }

  if (status === 'SHIPPED') {
    updateData.shippedAt = new Date()
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (carrier) updateData.carrier = carrier
  }

  if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date()
  }

  const [updatedOrder] = await db.$transaction([
    db.order.update({
      where: { id },
      data: updateData,
    }),
    db.orderStatusHistory.create({
      data: {
        orderId: id,
        status,
        note,
      },
    }),
  ])

  // Send notification emails
  const customerEmail = order.customer?.email || order.guestEmail
  if (customerEmail) {
    try {
      if (status === 'SHIPPED') {
        const estimatedDays = order.shippingMethod
          ? `${order.shippingMethod.estimatedDaysMin}-${order.shippingMethod.estimatedDaysMax} business days`
          : '3-7 business days'

        const html = await render(
          ShippingNotification({
            orderNumber: order.orderNumber,
            trackingNumber: trackingNumber || order.trackingNumber || '',
            carrier: carrier || order.carrier || 'Standard',
            estimatedDelivery: estimatedDays,
            items: order.items.map((item) => ({
              name: item.variantName
                ? `${item.productName} (${item.variantName})`
                : item.productName,
              quantity: item.quantity,
            })),
          })
        )

        await sendEmail({
          to: customerEmail,
          subject: `Your order ${order.orderNumber} has been shipped`,
          html,
        })

        await db.emailLog.create({
          data: {
            to: customerEmail,
            type: 'SHIPPING_NOTIFICATION',
            subject: `Your order ${order.orderNumber} has been shipped`,
            status: 'sent',
          },
        })
      }

      if (status === 'DELIVERED') {
        const customerName = order.customer?.name || order.guestName || 'there'

        const html = await render(
          DeliveryConfirmation({
            orderNumber: order.orderNumber,
            customerName,
            items: order.items.map((item) => ({
              name: item.variantName
                ? `${item.productName} (${item.variantName})`
                : item.productName,
              quantity: item.quantity,
            })),
          })
        )

        await sendEmail({
          to: customerEmail,
          subject: `Your order ${order.orderNumber} has been delivered`,
          html,
        })

        await db.emailLog.create({
          data: {
            to: customerEmail,
            type: 'DELIVERY_CONFIRMATION',
            subject: `Your order ${order.orderNumber} has been delivered`,
            status: 'sent',
          },
        })
      }
    } catch (emailError) {
      console.error('[Status Update] Failed to send notification email:', emailError)
      // Don't fail the status update if email fails
    }
  }

  return NextResponse.json(updatedOrder)
}
