'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Package, Truck, FileText } from 'lucide-react'

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  items: Array<{
    id: string
    productName: string
    productImage: string | null
    variantName: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  shippingAddress: {
    name?: string
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  customerNote: string | null
  total: number
  subtotal: number
  shippingCost: number
  discountAmount: number
}

export default function FulfillOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('Correos')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId])

  async function handleFulfill() {
    if (!trackingNumber.trim()) {
      setError('Tracking number is required')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SHIPPED',
          trackingNumber,
          carrier,
        }),
      })

      if (!res.ok) throw new Error('Failed to update order')

      router.push(`/admin/orders/${orderId}`)
      router.refresh()
    } catch {
      setError('Failed to fulfill order')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!order) {
    return <div className="py-16 text-center text-gray-500">Order not found</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/orders/${orderId}`} className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Fulfill {order.orderNumber}
          </h2>
          <p className="text-sm text-gray-500">
            Pack items and enter shipping details
          </p>
        </div>
      </div>

      {/* Packing Slip */}
      <div className="rounded-xl border border-gray-200 bg-white" id="packing-slip">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Packing Slip</h3>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <FileText className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Order</p>
              <p className="text-sm font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Ship To</p>
              <p className="text-sm">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-sm text-gray-600">{order.shippingAddress.line2}</p>
              )}
              <p className="text-sm text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
            </div>
          </div>

          {order.customerNote && (
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-700">Customer Note</p>
              <p className="text-sm text-amber-800">{order.customerNote}</p>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-medium uppercase text-gray-500">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Packed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-xs text-gray-500">{item.variantName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center text-sm font-medium">{item.quantity}</td>
                  <td className="py-3 text-right">
                    <input type="checkbox" className="rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Shipping Details</h3>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            >
              <option value="Correos">Correos</option>
              <option value="SEUR">SEUR</option>
              <option value="MRW">MRW</option>
              <option value="DHL">DHL</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="GLS">GLS</option>
              <option value="Royal Mail">Royal Mail</option>
              <option value="USPS">USPS</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tracking Number</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="ES123456789"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleFulfill}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-charcoal px-6 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Mark as Shipped
          </button>
          <Link
            href={`/api/orders/${orderId}/invoice`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Download Invoice
          </Link>
        </div>
      </div>
    </div>
  )
}
