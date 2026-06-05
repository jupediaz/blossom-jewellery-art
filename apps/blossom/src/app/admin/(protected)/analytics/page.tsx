import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/StatsCard'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { AnalyticsChartsLoader as AnalyticsCharts } from './AnalyticsChartsLoader'
import { DateRangeSelector } from './DateRangeSelector'
import Link from 'next/link'

const VALID_DAYS = [7, 30, 90, 365] as const

interface Props {
  searchParams: Promise<{ days?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const { days: daysParam } = await searchParams
  const days = VALID_DAYS.includes(Number(daysParam) as (typeof VALID_DAYS)[number])
    ? Number(daysParam)
    : 30

  const now = new Date()
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000)

  const [currentPeriod, previousPeriod, statusBreakdown, topProducts, customerStats] =
    await Promise.all([
      db.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: periodStart } },
        _sum: { total: true },
        _count: true,
        _avg: { total: true },
      }),
      db.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: prevPeriodStart, lt: periodStart },
        },
        _sum: { total: true },
        _count: true,
      }),
      db.order.groupBy({
        by: ['status'],
        _count: true,
        where: { createdAt: { gte: periodStart } },
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
          AND o."createdAt" >= ${periodStart}
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

  const dailyRevenue = await db.$queryRaw<
    Array<{ date: string; revenue: number; orders: number }>
  >`
    SELECT
      TO_CHAR(DATE(o."createdAt"), 'YYYY-MM-DD') as date,
      COALESCE(SUM(o.total), 0)::float as revenue,
      COUNT(*)::int as orders
    FROM "Order" o
    WHERE o."paymentStatus" = 'PAID'
      AND o."createdAt" >= ${periodStart}
    GROUP BY DATE(o."createdAt")
    ORDER BY date ASC
  `

  const rangeLabel = days === 7 ? 'Last 7 days' : days === 30 ? 'Last 30 days' : days === 90 ? 'Last 90 days' : 'Last 12 months'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">{rangeLabel} performance vs. previous period</p>
        </div>
        <DateRangeSelector currentDays={days} />
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
