'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Package, Search, Truck, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

type TrackResult = {
  orderNumber: string
  status: string
  paymentStatus: string
  trackingNumber: string | null
  carrier: string | null
  createdAt: string
  total: number | string
  items: Array<{
    productName: string
    variantName: string | null
    quantity: number
    unitPrice: number | string
  }>
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: Clock,
  PROCESSING: Clock,
  SHIPPED: Truck,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-600 bg-amber-50',
  CONFIRMED: 'text-blue-600 bg-blue-50',
  PROCESSING: 'text-blue-600 bg-blue-50',
  SHIPPED: 'text-indigo-600 bg-indigo-50',
  DELIVERED: 'text-emerald-600 bg-emerald-50',
  CANCELLED: 'text-red-600 bg-red-50',
  REFUNDED: 'text-gray-600 bg-gray-100',
}

export default function TrackOrderPage() {
  const t = useTranslations('Account')
  const tc = useTranslations('Common')

  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(t('orderNotFound'))
      } else {
        setResult(data)
      }
    } catch {
      setError(tc('error'))
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = result ? (STATUS_ICONS[result.status] ?? Package) : null

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <Package className="mx-auto mb-4 h-10 w-10 text-warm-gray" />
        <h1 className="font-heading text-3xl font-light text-charcoal">{t('trackOrder')}</h1>
        <p className="mt-2 text-sm text-warm-gray">{t('trackOrderDesc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">{t('orderNumber')}</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="BLO-12345"
            required
            className="w-full rounded-lg border border-cream-dark bg-white px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-lg border border-cream-dark bg-white px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal py-2.5 text-sm font-medium text-cream hover:bg-charcoal/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t('trackOrder')}
        </button>
      </form>

      {result && StatusIcon && (
        <div className="mt-8 space-y-4 rounded-xl border border-cream-dark bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-warm-gray uppercase tracking-wide">{t('orderNumber')}</p>
              <p className="font-medium text-charcoal">{result.orderNumber}</p>
            </div>
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[result.status] ?? 'bg-gray-100 text-gray-600'}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {t(`orderStatus.${result.status}`)}
            </span>
          </div>

          <div className="border-t border-cream-dark pt-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-warm-gray">{t('orderDate')}</span>
              <span>{format(new Date(result.createdAt), 'd MMM yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">{tc('total')}</span>
              <span className="font-medium">{formatPrice(Number(result.total))}</span>
            </div>
            {result.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-warm-gray">{t('tracking')}</span>
                <a
                  href={`https://www.17track.net/en/track#nums=${result.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-charcoal underline"
                >
                  {result.carrier && `${result.carrier}: `}{result.trackingNumber}
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-cream-dark pt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-warm-gray">{t('items')}</p>
            {result.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-charcoal">
                  {item.productName}{item.variantName && ` — ${item.variantName}`}
                  {item.quantity > 1 && <span className="ml-1 text-warm-gray">×{item.quantity}</span>}
                </span>
                <span className="text-warm-gray">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
