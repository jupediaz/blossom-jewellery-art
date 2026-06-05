import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const CANCELLABLE = new Set(['PENDING', 'CONFIRMED'])

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!CANCELLABLE.has(order.status)) {
      return NextResponse.json(
        { error: 'This order can no longer be cancelled' },
        { status: 422 }
      )
    }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
      await tx.orderStatusHistory.create({
        data: { orderId: id, status: 'CANCELLED', note: 'Cancelled by customer' },
      })
      // Release reserved inventory — floor at 0 to prevent negative values from race conditions
      for (const item of order.items) {
        await tx.$executeRaw`
          UPDATE "Inventory"
          SET "quantityReserved" = GREATEST(0, "quantityReserved" - ${item.quantity})
          WHERE "sanityProductId" = ${item.sanityProductId}
        `
      }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
