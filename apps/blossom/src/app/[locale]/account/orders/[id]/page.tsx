import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Package, ArrowLeft, Truck } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { formatPrice } from '@/lib/utils'
import { CancelOrderButton } from './CancelOrderButton'
import { ReturnRequestButton } from './ReturnRequestButton'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const t = await getTranslations('Account')
  const tc = await getTranslations('Common')
  const locale = await getLocale()

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
      shippingMethod: true,
      coupon: { select: { code: true } },
    },
  })

  if (!order || order.customerId !== session.user.id) {
    notFound()
  }

  const shippingAddress = order.shippingAddress as {
    name?: string
    firstName?: string
    lastName?: string
    line1?: string
    city?: string
    postalCode?: string
    country?: string
  }
  const recipientName =
    shippingAddress.name ||
    [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(' ') ||
    null

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
            {order.createdAt.toLocaleDateString(locale, {
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
        <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Truck size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                {t('tracking')}: {order.trackingNumber}
              </p>
              {order.carrier && (
                <p className="text-xs text-blue-600">{order.carrier}</p>
              )}
            </div>
          </div>
          <a
            href={`https://www.17track.net/en/track#nums=${order.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {t('trackPackage')}
          </a>
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
            <span>
              {tc('discount')}
              {order.coupon?.code && (
                <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider border border-emerald-200">
                  {order.coupon.code}
                </span>
              )}
            </span>
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

      {/* Status Timeline */}
      {order.statusHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">{t('orderTimeline')}</h3>
          <div className="relative border-l border-cream-dark ml-3 space-y-4">
            {order.statusHistory.map((entry, i) => (
              <div key={entry.id} className="relative pl-6">
                <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-charcoal' : 'bg-cream-dark border border-warm-gray'}`} />
                <p className="text-xs font-medium text-charcoal">{t(`orderStatus.${entry.status}`)}</p>
                <p className="text-[11px] text-warm-gray">
                  {entry.createdAt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {entry.note && <p className="text-xs text-warm-gray mt-0.5 italic">{entry.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <div>
          <h3 className="text-sm font-medium mb-2">{t('shippingAddress')}</h3>
          <div className="rounded-xl border border-cream-dark p-4 text-sm text-warm-gray">
            {recipientName && (
              <p className="font-medium text-charcoal">{recipientName}</p>
            )}
            {shippingAddress.line1 && <p>{shippingAddress.line1}</p>}
            <p>
              {shippingAddress.city}
              {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
            </p>
            {shippingAddress.country && <p>{shippingAddress.country}</p>}
          </div>
        </div>
      )}

      {/* Cancel Order */}
      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
        <CancelOrderButton orderId={order.id} />
      )}

      {/* Return Request */}
      {order.status === 'DELIVERED' && (() => {
        const referenceDate = order.deliveredAt ?? order.createdAt
        const windowEnd = new Date(referenceDate)
        windowEnd.setDate(windowEnd.getDate() + 30)
        return new Date() <= windowEnd
      })() && (
        <ReturnRequestButton orderId={order.id} />
      )}
    </div>
  )
}
