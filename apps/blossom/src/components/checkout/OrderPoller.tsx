'use client'

import { useEffect, useState } from 'react'
import { Package, Loader2, ExternalLink } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  variantName: string | null
  productImage: string | null
  unitPrice: number
  quantity: number
  totalPrice: number
}

interface Order {
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  couponId: string | null
  items: OrderItem[]
}

const MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 2000

export function OrderPoller({ sessionId }: { sessionId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [gaveUp, setGaveUp] = useState(false)
  const t = useTranslations('Checkout')
  const tc = useTranslations('Common')

  useEffect(() => {
    let cancelled = false

    async function poll(attempt: number) {
      if (cancelled || attempt >= MAX_ATTEMPTS) {
        if (!cancelled) setGaveUp(true)
        return
      }

      try {
        const res = await fetch(`/api/checkout/order-status?session_id=${sessionId}`)
        const data = await res.json()
        if (data.found && data.order) {
          if (!cancelled) setOrder(data.order)
          return
        }
      } catch {
        // network error — keep retrying
      }

      if (!cancelled) {
        setAttempts(attempt + 1)
        // Exponential backoff: 2s, 4s, 6s, 8s
        setTimeout(() => poll(attempt + 1), BASE_DELAY_MS * (attempt + 1))
      }
    }

    poll(0)
    return () => { cancelled = true }
  }, [sessionId])

  if (order) {
    return (
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
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-gray-500">{item.variantName}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(Number(item.totalPrice))}</p>
                  <p className="text-xs text-gray-500">{t('qty', { count: item.quantity })}</p>
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

        <p className="text-center text-sm text-gray-500">{t('confirmationEmail')}</p>
      </div>
    )
  }

  if (gaveUp) {
    return (
      <div className="mt-4 text-center space-y-4">
        <p className="text-warm-gray text-sm">{t('confirmationEmailNoOrder')}</p>
        <p className="text-xs text-warm-gray/60">
          {t('reference')}: {sessionId.slice(0, 20)}...
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center gap-2 rounded bg-charcoal text-cream text-sm px-5 py-2.5 hover:bg-charcoal/90 transition-colors"
          >
            <Package size={15} />
            {t('viewOrders')}
          </Link>
          <a
            href="mailto:hello@blossombyolha.com"
            className="inline-flex items-center justify-center gap-2 rounded border border-cream-dark text-charcoal text-sm px-5 py-2.5 hover:border-charcoal transition-colors"
          >
            <ExternalLink size={15} />
            {t('contactSupport')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <p className="text-sm text-warm-gray">{t('processingOrder')}</p>
      {attempts > 0 && (
        <p className="text-xs text-warm-gray/50">{t('processingRetry', { attempt: attempts, max: MAX_ATTEMPTS })}</p>
      )}
    </div>
  )
}
