import { db } from '@/lib/db'
import Link from 'next/link'
import { ShoppingCart, Mail, Zap, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/admin/StatsCard'

export default async function MarketingPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    abandonedCarts,
    recoveredCarts,
    recoveryEmails,
    activeOffers,
    activeCoupons,
    couponUsage,
  ] = await Promise.all([
    db.cartSession.count({
      where: {
        abandonedAt: { not: null },
        convertedOrderId: null,
        recoveredAt: null,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.cartSession.count({
      where: {
        recoveredAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.emailLog.count({
      where: {
        type: { in: ['CART_RECOVERY_1H', 'CART_RECOVERY_24H', 'CART_RECOVERY_48H'] },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.offer.count({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
    }),
    db.coupon.count({ where: { isActive: true } }),
    db.order.count({
      where: {
        couponId: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  const recoveryRate =
    abandonedCarts + recoveredCarts > 0
      ? Math.round((recoveredCarts / (abandonedCarts + recoveredCarts)) * 100)
      : 0

  const recentAbandoned = await db.cartSession.findMany({
    where: {
      abandonedAt: { not: null },
      convertedOrderId: null,
    },
    include: { customer: true },
    orderBy: { abandonedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Marketing</h2>
        <p className="text-sm text-gray-500">Last 30 days overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={ShoppingCart}
          label="Abandoned Carts"
          value={abandonedCarts}
        />
        <StatsCard
          icon={TrendingUp}
          label="Recovery Rate"
          value={`${recoveryRate}%`}
        />
        <StatsCard
          icon={Mail}
          label="Recovery Emails Sent"
          value={recoveryEmails}
        />
        <StatsCard
          icon={Zap}
          label="Active Offers"
          value={activeOffers}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <Link
              href="/admin/offers/new"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Create Flash Sale</span>
            </Link>
            <Link
              href="/admin/coupons/new"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Create Coupon</span>
            </Link>
            <Link
              href="/admin/offers"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50"
            >
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">
                Manage Offers ({activeOffers} active)
              </span>
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              <span className="text-sm">
                Manage Coupons ({activeCoupons} active, {couponUsage} used)
              </span>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-medium text-gray-900">Recent Abandoned Carts</h3>
          </div>
          {recentAbandoned.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              No abandoned carts yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentAbandoned.map((cart) => (
                <div key={cart.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cart.customer?.name || cart.customer?.email || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500">
                        &euro;{Number(cart.subtotal).toFixed(2)} &middot;{' '}
                        {cart.abandonedAt?.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cart.recoveryEmailSent
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {cart.recoveryEmailSent ? 'Email sent' : 'Pending'}
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
