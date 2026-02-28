import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/StatsCard'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { AnalyticsChartsLoader as AnalyticsCharts } from './AnalyticsChartsLoader'

export default async function AnalyticsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Aggregate data server-side
  const [currentPeriod, previousPeriod, statusBreakdown, topProducts, customerStats] =
    await Promise.all([
      db.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),
      db.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { total: true },
        _count: true,
      }),
      db.order.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      db.$queryRaw<
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
      `,
      db.user.count({ where: { role: 'CUSTOMER' } }),
    ])

  const revenue = Number(currentPeriod._sum.total || 0)
  const prevRevenue = Number(previousPeriod._sum.total || 0)
  const revenueChange = prevRevenue > 0
    ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
    : 0

  const orders = currentPeriod._count
  const prevOrders = previousPeriod._count
  const ordersChange = prevOrders > 0
    ? Math.round(((orders - prevOrders) / prevOrders) * 100)
    : 0

  const avgOrder = Number(currentPeriod._avg.total || 0)

  // Get daily revenue for chart
  const dailyRevenue = await db.$queryRaw<
    Array<{ date: string; revenue: number; orders: number }>
  >`
    SELECT
      TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
      COALESCE(SUM(o.total), 0)::float as revenue,
      COUNT(*)::int as orders
    FROM "Order" o
    WHERE o."paymentStatus" = 'PAID'
      AND o."createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE(o."createdAt")
    ORDER BY date ASC
  `

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500">Last 30 days performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={DollarSign}
          label="Revenue"
          value={`€${revenue.toFixed(2)}`}
          change={revenueChange}
        />
        <StatsCard
          icon={ShoppingBag}
          label="Orders"
          value={orders}
          change={ordersChange}
        />
        <StatsCard
          icon={TrendingUp}
          label="Avg. Order Value"
          value={`€${avgOrder.toFixed(2)}`}
        />
        <StatsCard
          icon={Users}
          label="Total Customers"
          value={customerStats}
        />
      </div>

      <AnalyticsCharts
        dailyRevenue={dailyRevenue}
        statusBreakdown={statusBreakdown.map((s) => ({
          status: s.status,
          count: s._count,
        }))}
        topProducts={topProducts}
      />
    </div>
  )
}
