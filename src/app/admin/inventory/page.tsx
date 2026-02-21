import { db } from '@/lib/db'
import { EmptyState } from '@/components/admin/EmptyState'
import { Package, AlertTriangle } from 'lucide-react'
import { InventoryActions } from './InventoryActions'

export default async function InventoryPage() {
  const inventory = await db.inventory.findMany({
    orderBy: [{ quantityTotal: 'asc' }],
    include: {
      _count: { select: { stockMovements: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Inventory</h2>
        <p className="text-sm text-gray-500">
          {inventory.length} products tracked
        </p>
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
                        {item.sanityProductId}
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
        </div>
      )}
    </div>
  )
}
