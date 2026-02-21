import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Package } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('orderHistory') }
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/account/login')

  const t = await getTranslations('Account')

  const orders = await db.order.findMany({
    where: { customerId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noOrders')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('noOrdersText')}
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">{t('orderHistory')}</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {order.createdAt.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : order.status === 'SHIPPED'
                      ? 'bg-blue-50 text-blue-700'
                      : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t(`orderStatus.${order.status}`)}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500">{item.variantName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      &euro;{Number(item.totalPrice).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{t('qty', { count: item.quantity })}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">
                {order.items.length} {order.items.length !== 1 ? 'items' : 'item'}
              </span>
              <span className="text-sm font-semibold">
                {t('totalLabel')}: &euro;{Number(order.total).toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              {order.trackingNumber && (
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  {t('tracking')}: {order.trackingNumber}
                  {order.carrier && ` (${order.carrier})`}
                </div>
              )}
              <Link
                href={`/account/orders/${order.id}`}
                className="ml-auto text-xs text-sage hover:text-sage-dark underline"
              >
                {t('viewOrder')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
