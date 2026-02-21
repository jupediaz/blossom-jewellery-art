import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Revenue and orders for last 30 days (daily breakdown)
  const dailyRevenue = await db.$queryRaw<
    Array<{ date: string; revenue: number; orders: number }>
  >`
    SELECT
      DATE(o."createdAt") as date,
      COALESCE(SUM(o.total), 0)::float as revenue,
      COUNT(*)::int as orders
    FROM "Order" o
    WHERE o."paymentStatus" = 'PAID'
      AND o."createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE(o."createdAt")
    ORDER BY date ASC
  `

  // Current period totals
  const currentPeriod = await db.order.aggregate({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: { total: true },
    _count: true,
    _avg: { total: true },
  })

  // Previous period totals (for comparison)
  const previousPeriod = await db.order.aggregate({
    where: {
      paymentStatus: 'PAID',
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
    _sum: { total: true },
    _count: true,
  })

  // Order status breakdown
  const statusBreakdown = await db.order.groupBy({
    by: ['status'],
    _count: true,
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  // Top selling products
  const topProducts = await db.$queryRaw<
    Array<{ productName: string; totalSold: number; revenue: number }>
  >`
    SELECT
      oi."productName",
      SUM(oi.quantity)::int as "totalSold",
      SUM(oi."totalPrice")::float as revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."paymentStatus" = 'PAID'
      AND o."createdAt" >= ${thirtyDaysAgo}
    GROUP BY oi."productName"
    ORDER BY "totalSold" DESC
    LIMIT 10
  `

  // Customer stats
  const newCustomers = await db.user.count({
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  const totalCustomers = await db.user.count({
    where: { role: 'CUSTOMER' },
  })

  // Coupon usage
  const couponOrders = await db.order.count({
    where: {
      couponId: { not: null },
      paymentStatus: 'PAID',
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  return NextResponse.json({
    dailyRevenue,
    summary: {
      revenue: Number(currentPeriod._sum.total || 0),
      orders: currentPeriod._count,
      averageOrderValue: Number(currentPeriod._avg.total || 0),
      previousRevenue: Number(previousPeriod._sum.total || 0),
      previousOrders: previousPeriod._count,
    },
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    topProducts,
    customers: {
      total: totalCustomers,
      new: newCustomers,
    },
    couponOrders,
  })
}
