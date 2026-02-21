import Link from 'next/link'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/admin/EmptyState'
import { Zap, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function OffersPage() {
  const offers = await db.offer.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Offers & Sales</h2>
          <p className="text-sm text-gray-500">{offers.length} offers</p>
        </div>
        <Link
          href="/admin/offers/new"
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          <Plus className="h-4 w-4" />
          Create Offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No offers yet"
          description="Create flash sales, seasonal offers, or collection-wide discounts"
          action={{ label: 'Create Offer', href: '/admin/offers/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Discount</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Scope</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offers.map((offer) => {
                const now = new Date()
                const isActive = offer.isActive && offer.validFrom <= now && offer.validUntil >= now

                return (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{offer.name}</p>
                      {offer.badgeText && (
                        <span className="mt-1 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                          {offer.badgeText}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {offer.type.replace('_', ' ')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      {offer.discountType === 'PERCENTAGE'
                        ? `${Number(offer.discountValue)}%`
                        : `€${Number(offer.discountValue)}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {offer.applyToAll
                        ? 'All products'
                        : `${offer.applicableProducts.length + offer.applicableCollections.length} items`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {format(offer.validFrom, 'dd MMM')} - {format(offer.validUntil, 'dd MMM yyyy')}
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
