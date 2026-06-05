import {
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  MessageSquare,
  Star,
  RotateCcw,
} from 'lucide-react'
import { db, contactMessageDb, type ContactMessage } from '@/lib/db'
import { StatsCard } from '@/components/admin/StatsCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState } from '@/components/admin/EmptyState'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'

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
    recentMessages,
    pendingReviews,
    pendingReturns,
    recentReturnRequests,
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
    contactMessageDb.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    db.review.count({ where: { isApproved: false } }),
    db.return.count({ where: { status: 'REQUESTED' } }),
    db.return.findMany({
      where: { status: { in: ['REQUESTED', 'UNDER_REVIEW'] } },
      include: {
        order: { select: { orderNumber: true, customer: { select: { name: true, email: true } }, guestName: true, guestEmail: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
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
    recentMessages,
    pendingReviews,
    pendingReturns,
    recentReturnRequests,
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
      recentMessages: [] as ContactMessage[],
      pendingReviews: 0,
      pendingReturns: 0,
      recentReturnRequests: [],
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

      {data.pendingReturns > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {data.pendingReturns} return request{data.pendingReturns !== 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-gray-500">Review and approve or reject customer returns</p>
            </div>
          </div>
          <Link href="/admin/returns" className="text-sm font-medium text-blue-700 hover:underline">
            Review →
          </Link>
        </div>
      )}

      {data.pendingReviews > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {data.pendingReviews} review{data.pendingReviews !== 1 ? 's' : ''} awaiting moderation
              </p>
              <p className="text-xs text-gray-500">Approve or reject customer reviews</p>
            </div>
          </div>
          <Link href="/admin/reviews" className="text-sm font-medium text-amber-700 hover:underline">
            Moderate →
          </Link>
        </div>
      )}

      {data.recentMessages.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between border-b border-blue-200 px-6 py-4">
            <h3 className="flex items-center gap-2 font-medium text-gray-900">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Unread Messages
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                {data.recentMessages.length}
              </span>
            </h3>
            <Link href="/admin/messages" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-blue-100">
            {data.recentMessages.map((msg: ContactMessage) => (
              <div key={msg.id} className="flex items-start justify-between px-6 py-3 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {msg.name} &mdash; <span className="font-normal text-gray-600">{msg.subject}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                </div>
                <p className="shrink-0 text-xs text-gray-400 pt-0.5">
                  {format(msg.createdAt, 'dd MMM')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
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

        {/* Recent Return Requests */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="flex items-center gap-2 font-medium text-gray-900">
              <RotateCcw className="h-4 w-4 text-blue-500" />
              Return Requests
              {data.pendingReturns > 0 && (
                <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                  {data.pendingReturns}
                </span>
              )}
            </h3>
            <Link href="/admin/returns" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {data.recentReturnRequests.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={RotateCcw}
                title="No open returns"
                description="Return requests will appear here"
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentReturnRequests.map((r) => {
                const customerName = r.order.customer?.name || r.order.guestName || r.order.customer?.email || r.order.guestEmail || '—'
                return (
                  <Link
                    key={r.id}
                    href="/admin/returns"
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.order.orderNumber}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">{customerName}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.status === 'REQUESTED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </Link>
                )
              })}
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
