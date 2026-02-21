import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react'
import { OrderActions } from './OrderActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      coupon: true,
      shippingMethod: { include: { zone: true } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) notFound()

  const shipping = order.shippingAddress as {
    firstName?: string
    lastName?: string
    line1?: string
    city?: string
    postalCode?: string
    country?: string
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            {order.orderNumber}
          </h2>
          <p className="text-sm text-gray-500">
            {format(order.createdAt, 'dd MMM yyyy, HH:mm')}
          </p>
        </div>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} type="payment" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <Package className="h-4 w-4" />
                Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-gray-500">{item.variantName}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(Number(item.totalPrice))}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 px-6 py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{formatPrice(Number(order.shippingCost))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Discount {order.coupon && `(${order.coupon.code})`}
                  </span>
                  <span className="text-emerald-600">
                    -{formatPrice(Number(order.discountAmount))}
                  </span>
                </div>
              )}
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatPrice(Number(order.taxAmount))}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="font-medium text-gray-900">Timeline</h3>
            </div>
            <div className="px-6 py-4">
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No status updates yet</p>
              ) : (
                <div className="space-y-4">
                  {order.statusHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-gray-500">{entry.note}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {format(entry.createdAt, 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <OrderActions orderId={order.id} currentStatus={order.status} />

          {/* Customer */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <User className="h-4 w-4" />
                Customer
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-900">
                {order.customer?.name || order.guestName || 'Guest'}
              </p>
              <p className="text-sm text-gray-500">
                {order.customer?.email || order.guestEmail}
              </p>
              {order.customer && (
                <Link
                  href={`/admin/customers/${order.customer.id}`}
                  className="mt-2 inline-block text-sm text-charcoal hover:underline"
                >
                  View customer profile
                </Link>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <MapPin className="h-4 w-4" />
                Shipping
              </h3>
            </div>
            <div className="px-6 py-4 text-sm text-gray-700">
              <p>{shipping.firstName} {shipping.lastName}</p>
              <p>{shipping.line1}</p>
              <p>
                {shipping.city}, {shipping.postalCode}
              </p>
              <p>{shipping.country}</p>
              {order.shippingMethod && (
                <p className="mt-2 text-gray-500">
                  {order.shippingMethod.name} ({order.shippingMethod.zone.name})
                </p>
              )}
              {order.trackingNumber && (
                <p className="mt-2 font-medium">
                  Tracking: {order.trackingNumber}
                </p>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <CreditCard className="h-4 w-4" />
                Payment
              </h3>
            </div>
            <div className="px-6 py-4 text-sm">
              <StatusBadge status={order.paymentStatus} type="payment" />
              {order.stripePaymentIntent && (
                <p className="mt-2 text-xs text-gray-400">
                  {order.stripePaymentIntent}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.customerNote || order.internalNote) && (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-4">
              {order.customerNote && (
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Customer Note
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{order.customerNote}</p>
                </div>
              )}
              {order.internalNote && (
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">
                    Internal Note
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{order.internalNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
