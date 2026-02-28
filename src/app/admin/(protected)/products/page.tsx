import { db } from '@/lib/db'
import { sanityFetch } from '@/lib/sanity/client'
import { allProductsQuery } from '@/lib/sanity/queries'
import { EmptyState } from '@/components/admin/EmptyState'
import { Package, ExternalLink, ImagePlus } from 'lucide-react'
import Link from 'next/link'
import { AIDescriptionGeneratorLoader as AIDescriptionGenerator } from './AIDescriptionGeneratorLoader'

interface SanityProduct {
  _id: string
  name: string
  slug: { current: string }
  price: number
  compareAtPrice?: number
  inStock: boolean
  imageUrl?: string
  category?: { name: string }
  collection?: { name: string }
}

export default async function AdminProductsPage() {
  const [products, inventoryRecords] = await Promise.all([
    sanityFetch<SanityProduct[]>(allProductsQuery),
    db.inventory.findMany(),
  ])

  // Build inventory lookup by sanityProductId
  const inventoryMap = new Map(
    inventoryRecords.map((inv) => [inv.sanityProductId, inv])
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            {products.length} products in Sanity CMS
          </p>
        </div>
        <Link
          href="/studio"
          target="_blank"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open Sanity Studio
        </Link>
      </div>

      <AIDescriptionGenerator />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Add products via Sanity Studio or run the database seed"
          action={{ label: 'Open Studio', href: '/studio' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const inventory = inventoryMap.get(product._id)
                const available = inventory
                  ? inventory.quantityTotal - inventory.quantityReserved - inventory.quantitySold
                  : null

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          {product.collection && (
                            <p className="text-xs text-gray-500">
                              {product.collection.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="text-sm font-medium">
                        &euro;{product.price}
                      </span>
                      {product.compareAtPrice && (
                        <span className="ml-1 text-xs text-gray-400 line-through">
                          &euro;{product.compareAtPrice}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {inventory ? (
                        <div>
                          <span
                            className={`text-sm font-medium ${
                              available! <= 0
                                ? 'text-red-600'
                                : available! <= inventory.lowStockThreshold
                                  ? 'text-amber-600'
                                  : 'text-gray-900'
                            }`}
                          >
                            {available}
                          </span>
                          <span className="text-xs text-gray-400">
                            {' '}/ {inventory.quantityTotal}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not tracked</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                      {product.category?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {!inventory ? (
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          Untracked
                        </span>
                      ) : available! <= 0 ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Out of Stock
                        </span>
                      ) : available! <= inventory.lowStockThreshold ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/admin/ai-studio?productId=${product._id}&productName=${encodeURIComponent(product.name)}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-200 px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50"
                      >
                        <ImagePlus className="h-3 w-3" />
                        AI Images
                      </Link>
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
