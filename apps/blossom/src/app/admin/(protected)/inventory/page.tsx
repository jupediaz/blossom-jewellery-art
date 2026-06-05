import Link from 'next/link'
import { db } from '@/lib/db'
import { EmptyState } from '@/components/admin/EmptyState'
import { Package, AlertTriangle } from 'lucide-react'
import { InventoryActions } from './InventoryActions'
import { InventorySyncButton } from './InventorySyncButton'

const ITEMS_PER_PAGE = 25

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))

  const [inventory, total] = await Promise.all([
    db.inventory.findMany({
      orderBy: [{ quantityTotal: 'asc' }],
      include: {
        _count: { select: { stockMovements: true } },
      },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    db.inventory.count(),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  // Build a map of sanityProductId -> product name from order items
  const productIds = inventory.map((i) => i.sanityProductId).filter(Boolean)
  const orderItems = productIds.length > 0
    ? await db.orderItem.findMany({
        where: { sanityProductId: { in: productIds } },
        select: { sanityProductId: true, productName: true },
        distinct: ['sanityProductId'],
        orderBy: { createdAt: 'desc' },
      })
    : []
  const productNameMap = new Map(orderItems.map((oi) => [oi.sanityProductId, oi.productName]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500">
            {total} products tracked
          </p>
        </div>
        <InventorySyncButton />
      </div>

      {inventory.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory records"
          description="Inventory records are created when products are synced from Sanity or added manually"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Reserved
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Available
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sold
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => {
                const available = item.quantityTotal - item.quantityReserved
                const isLow = available <= item.lowStockThreshold
                const isOut = available <= 0

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {productNameMap.get(item.sanityProductId) || item.sanityProductId}
                      </p>
                      {item.sanityVariantKey && (
                        <p className="text-xs text-gray-500">
                          {item.sanityVariantKey}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.sku ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                      {item.quantityTotal}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {item.quantityReserved}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <span
                        className={
                          isOut
                            ? 'text-red-600'
                            : isLow
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                        }
                      >
                        {available}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {item.quantitySold}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Out of stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          In stock
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <InventoryActions
                        inventoryId={item.id}
                        currentTotal={item.quantityTotal}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/inventory?page=${page - 1}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/inventory?page=${page + 1}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
