import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Package, MapPin, Heart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('title') }
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/account/login')

  const t = await getTranslations('Account')
  const tc = await getTranslations('Common')

  const [orderCount, addressCount, wishlistCount, recentOrders] = await Promise.all([
    db.order.count({ where: { customerId: session.user.id } }),
    db.address.count({ where: { userId: session.user.id } }),
    db.wishlist.count({ where: { userId: session.user.id } }),
    db.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const stats = [
    { label: t('orders'), value: orderCount, icon: Package, href: '/account/orders' },
    { label: t('addresses'), value: addressCount, icon: MapPin, href: '/account/addresses' },
    { label: t('wishlist'), value: wishlistCount, icon: Heart, href: '/account/wishlist' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-gray-900">
          {t('welcomeBack')}{session.user.name ? `, ${session.user.name}` : ''}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:border-gray-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <stat.icon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{t('recentOrders')}</h3>
            <Link href="/account/orders" className="text-sm text-gray-500 hover:text-gray-900">
              {tc('viewAll')}
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-gray-300"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {order.createdAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">&euro;{Number(order.total).toFixed(2)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700'
                          : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t(`orderStatus.${order.status}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
