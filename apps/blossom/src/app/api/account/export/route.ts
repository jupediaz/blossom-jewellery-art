import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const [user, orders, addresses, wishlistItems] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.order.findMany({
      where: { customerId: userId },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: { productName: true, quantity: true, unitPrice: true },
        },
      },
    }),
    db.address.findMany({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        phone: true,
      },
    }),
    db.wishlist.findMany({
      where: { userId },
      select: { sanityProductId: true, createdAt: true },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: user,
    addresses,
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt,
      items: o.items,
    })),
    wishlist: wishlistItems,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="my-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
