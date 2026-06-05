import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { OrderStatus } from '@/generated/prisma/client'

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCSV).join(',')
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const statusFilter = searchParams.get('status') as OrderStatus | null
  const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
  const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(from || to
      ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10_000,
    include: {
      customer: { select: { name: true, email: true } },
      coupon: { select: { code: true } },
      shippingMethod: { select: { name: true } },
      items: { select: { productName: true, variantName: true, quantity: true, totalPrice: true } },
    },
  })

  const headers = [
    'Order Number',
    'Date',
    'Status',
    'Payment Status',
    'Customer Name',
    'Customer Email',
    'Items',
    'Subtotal',
    'Shipping',
    'Discount',
    'Total',
    'Currency',
    'Coupon',
    'Shipping Method',
    'Tracking Number',
  ]

  const lines = [
    headers.join(','),
    ...orders.map((o) => {
      const name = o.customer?.name ?? o.guestName ?? 'Guest'
      const email = o.customer?.email ?? o.guestEmail ?? ''
      const itemsSummary = o.items
        .map((i) => `${i.productName}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity}`)
        .join('; ')

      return row([
        o.orderNumber,
        o.createdAt.toISOString(),
        o.status,
        o.paymentStatus,
        name,
        email,
        itemsSummary,
        Number(o.subtotal),
        Number(o.shippingCost),
        Number(o.discountAmount),
        Number(o.total),
        o.currency,
        o.coupon?.code ?? '',
        o.shippingMethod?.name ?? '',
        o.trackingNumber ?? '',
      ])
    }),
  ]

  const csv = lines.join('\r\n')
  const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
