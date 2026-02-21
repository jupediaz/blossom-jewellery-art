import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
} from 'lucide-react'
import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/StatsCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState } from '@/components/admin/EmptyState'
import { formatPrice } from '@/lib/utils'

async function getDashboardData() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    todayOrders,
    monthOrders,
    lastMonthOrders,
    pendingOrders,
    lowStockItems,
    recentOrders,
    totalCustomers,
  ] = await Promise.all([
    db.order.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _count: true,
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _count: true,
      _sum: { total: true },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _count: true,
      _sum: { total: true },
    }),
    db.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
    }),
    db.$queryRaw<Array<{
      id: string
      sanityProductId: string
      sanityVariantKey: string | null
      sku: string | null
      quantityTotal: number
      quantityReserved: number
      lowStockThreshold: number
    }>>`
      SELECT id, "sanityProductId", "sanityVariantKey", sku, "quantityTotal", "quantityReserved", "lowStockThreshold"
      FROM "Inventory"
      WHERE "trackInventory" = true
        AND ("quantityTotal" - "quantityReserved") <= "lowStockThreshold"
      LIMIT 5
    `,
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true },
    }),
    db.user.count({ where: { role: 'CUSTOMER' } }),
  ])

  const monthRevenue = Number(monthOrders._sum.total ?? 0)
  const lastMonthRevenue = Number(lastMonthOrders._sum.total ?? 0)
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  return {
    todayOrders: todayOrders._count,
    todayRevenue: Number(todayOrders._sum.total ?? 0),
    monthOrders: monthOrders._count,
    monthRevenue,
    revenueChange,
    pendingOrders,
    lowStockItems,
    recentOrders,
    totalCustomers,
  }
}

export default async function AdminDashboard() {
  let data
  try {
    data = await getDashboardData()
  } catch {
    // Database might not have data yet
    data = {
      todayOrders: 0,
      todayRevenue: 0,
      monthOrders: 0,
      monthRevenue: 0,
      revenueChange: 0,
      pendingOrders: 0,
      lowStockItems: [],
      recentOrders: [],
      totalCustomers: 0,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of your store performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Revenue"
          value={formatPrice(data.todayRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Today's Orders"
          value={data.todayOrders}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Month Revenue"
          value={formatPrice(data.monthRevenue)}
          change={{ value: data.revenueChange, label: 'vs last month' }}
          trend={data.revenueChange > 0 ? 'up' : data.revenueChange < 0 ? 'down' : 'neutral'}
          icon={TrendingUp}
        />
        <StatsCard
          title="Pending Orders"
          value={data.pendingOrders}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-medium text-gray-900">Recent Orders</h3>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="Orders will appear here once customers start purchasing"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentOrders.map((order) => (
                <a
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.name || order.guestName || order.guestEmail}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-medium text-gray-900">Low Stock Alerts</h3>
          </div>
          {data.lowStockItems.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title="Stock levels healthy"
                description="No products are running low on stock"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.sku ?? item.sanityProductId}
                    </p>
                    {item.sanityVariantKey && (
                      <p className="text-xs text-gray-500">{item.sanityVariantKey}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">
                      {item.quantityTotal - item.quantityReserved} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
