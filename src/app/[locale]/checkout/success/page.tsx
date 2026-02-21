import { Link } from '@/i18n/navigation'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import { getTranslations } from 'next-intl/server'
import { formatPrice } from '@/lib/utils'
import { PurchaseTracker } from '@/components/PurchaseTracker'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Checkout')
  return { title: t('success') }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id
  const t = await getTranslations('Checkout')
  const tc = await getTranslations('Common')

  // Try to find the order by Stripe session ID
  const order = sessionId
    ? await db.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { items: true },
      })
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <div className="text-center">
        <CheckCircle size={48} className="mx-auto text-emerald-500 mb-6" />
        <h1 className="font-heading text-3xl font-light mb-4">
          {t('success')}
        </h1>
        <p className="text-warm-gray mb-2">
          {t('successText')}
        </p>
      </div>

      {order && (
        <PurchaseTracker
          orderId={order.orderNumber}
          total={Number(order.total)}
          shipping={Number(order.shippingCost)}
          coupon={order.couponId ?? undefined}
        />
      )}

      {order ? (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-900">
                {t('orderNumber')} {order.orderNumber}
              </p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {t('confirmed')}
              </span>
            </div>

            <div className="space-y-3">
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
                      {formatPrice(Number(item.totalPrice))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('qty', { count: item.quantity })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{tc('subtotal')}</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>{tc('discount')}</span>
                  <span>-{formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>{tc('shipping')}</span>
                <span>
                  {Number(order.shippingCost) > 0
                    ? formatPrice(Number(order.shippingCost))
                    : tc('free')}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>{tc('total')}</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            {t('confirmationEmail')}
          </p>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-warm-gray text-sm mb-8">
            {t('confirmationEmailNoOrder')}
          </p>
          {sessionId && (
            <p className="text-xs text-warm-gray/60 mb-8">
              {t('reference')}: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
        >
          {tc('continueShopping')}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
