import Link from 'next/link'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/admin/EmptyState'
import { Ticket, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500">{coupons.length} coupons</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Link>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create discount coupons for your customers"
          action={{ label: 'Create Coupon', href: '/admin/coupons/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Value</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Uses</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Valid Until</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => {
                const now = new Date()
                const isExpired = coupon.validUntil && coupon.validUntil < now
                const isMaxed = coupon.maxUses && coupon.currentUses >= coupon.maxUses
                const isActive = coupon.isActive && !isExpired && !isMaxed

                return (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-medium">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {coupon.type === 'PERCENTAGE' ? 'Percentage' : coupon.type === 'FIXED_AMOUNT' ? 'Fixed' : 'Free Shipping'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      {coupon.type === 'PERCENTAGE'
                        ? `${Number(coupon.value)}%`
                        : coupon.type === 'FIXED_AMOUNT'
                          ? `€${Number(coupon.value)}`
                          : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : isMaxed ? 'Maxed' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {coupon.validUntil ? format(coupon.validUntil, 'dd MMM yyyy') : 'No expiry'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
