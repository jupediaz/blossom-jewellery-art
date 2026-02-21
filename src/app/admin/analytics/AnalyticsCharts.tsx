'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsChartsProps {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  statusBreakdown: Array<{ status: string; count: number }>
  topProducts: Array<{ productName: string; totalSold: number; revenue: number }>
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#fbbf24',
  CONFIRMED: '#60a5fa',
  PROCESSING: '#a78bfa',
  SHIPPED: '#34d399',
  DELIVERED: '#10b981',
  CANCELLED: '#f87171',
  REFUNDED: '#94a3b8',
}

export function AnalyticsCharts({
  dailyRevenue,
  statusBreakdown,
  topProducts,
}: AnalyticsChartsProps) {
  const formattedRevenue = dailyRevenue.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-medium text-gray-900">Revenue (Last 30 Days)</h3>
        {formattedRevenue.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Revenue']}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#1a1a1a"
                fill="#1a1a1a"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-medium text-gray-900">Order Status</h3>
          {statusBreakdown.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No orders yet
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {statusBreakdown.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={STATUS_COLORS[entry.status] || '#e5e7eb'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: STATUS_COLORS[s.status] || '#e5e7eb',
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {s.status.charAt(0) + s.status.slice(1).toLowerCase()}: {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-medium text-gray-900">Top Products</h3>
          {topProducts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={topProducts.slice(0, 5)}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units Sold']}
                />
                <Bar dataKey="totalSold" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
