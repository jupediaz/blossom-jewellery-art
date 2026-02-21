import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Package, ArrowLeft, Truck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { formatPrice } from '@/lib/utils'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/account/login')

  const { id } = await params
  const t = await getTranslations('Account')
  const tc = await getTranslations('Common')

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      shippingMethod: true,
    },
  })

  if (!order || order.customerId !== session.user.id) {
    notFound()
  }

  const shippingAddress = order.shippingAddress as {
    firstName?: string
    lastName?: string
    line1?: string
    city?: string
    postalCode?: string
    country?: string
  }

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors"
      >
        <ArrowLeft size={14} />
        {t('backToOrders')}
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-medium">{t('orderDetails')}</h2>
          <p className="text-sm text-warm-gray mt-1">{order.orderNumber}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
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

      {/* Order info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-cream-dark p-4">
          <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">{t('orderDate')}</p>
          <p className="text-sm font-medium">
            {order.createdAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="rounded-xl border border-cream-dark p-4">
          <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">{t('paymentStatus')}</p>
          <p className="text-sm font-medium">{t(`paymentStatusLabels.${order.paymentStatus}`)}</p>
        </div>
        <div className="rounded-xl border border-cream-dark p-4">
          <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">{tc('total')}</p>
          <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
        </div>
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">
          <Truck size={18} className="text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              {t('tracking')}: {order.trackingNumber}
            </p>
            {order.carrier && (
              <p className="text-xs text-blue-600">{order.carrier}</p>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <h3 className="text-sm font-medium mb-3">{t('orderItems')}</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-cream-dark p-3"
            >
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-cream-dark">
                  <Package size={20} className="text-warm-gray" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-warm-gray">{item.variantName}</p>
                )}
                <p className="text-xs text-warm-gray mt-0.5">
                  {t('qty', { count: item.quantity })} &times; {formatPrice(Number(item.unitPrice))}
                </p>
              </div>
              <p className="text-sm font-medium">{formatPrice(Number(item.totalPrice))}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-cream-dark p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-warm-gray">{tc('subtotal')}</span>
          <span>{formatPrice(Number(order.subtotal))}</span>
        </div>
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>{tc('discount')}</span>
            <span>-{formatPrice(Number(order.discountAmount))}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-warm-gray">{tc('shipping')}</span>
          <span>
            {Number(order.shippingCost) === 0
              ? tc('free')
              : formatPrice(Number(order.shippingCost))}
          </span>
        </div>
        <div className="border-t border-cream-dark pt-2 flex justify-between font-medium">
          <span>{tc('total')}</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {/* Shipping Address */}
      {shippingAddress && (
        <div>
          <h3 className="text-sm font-medium mb-2">{t('shippingAddress')}</h3>
          <div className="rounded-xl border border-cream-dark p-4 text-sm text-warm-gray">
            <p className="font-medium text-charcoal">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
            <p>
              {shippingAddress.city}
              {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
            </p>
            {shippingAddress.country && <p>{shippingAddress.country}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
