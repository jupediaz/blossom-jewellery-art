import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Package, Layers } from 'lucide-react'
import { getCollectionBySlug } from '@/lib/cms/queries'
import { db } from '@/lib/db'
import type { Collection } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AdminCollectionDetailPage({ params }: Props) {
  const { slug } = await params

  const collection = await getCollectionBySlug(slug)

  if (!collection) {
    notFound()
  }

  const products = collection.products ?? []

  // Fetch Postgres inventory for all products in this collection
  const productIds = products.map((p) => p._id).filter(Boolean)
  const inventoryRecords =
    productIds.length > 0
      ? await db.inventory.findMany({
          where: { sanityProductId: { in: productIds } },
        })
      : []

  const inventoryMap = new Map(inventoryRecords.map((inv) => [inv.sanityProductId, inv]))

  const coverUrl = collection.image?.url ?? null

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/admin/collections"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All collections
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {coverUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200">
                <Image
                  src={coverUrl}
                  alt={collection.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                <Layers className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{collection.name}</h2>
              {collection.description && (
                <p className="mt-1 max-w-prose text-sm text-gray-500">
                  {collection.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            </div>
          </div>

          <Link
            href={`/studio`}
            target="_blank"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Edit in Studio
          </Link>
        </div>
      </div>

      {/* Products table */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Package className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No products in this collection</h3>
          <p className="mt-1 text-sm text-gray-500">
            Assign products to this collection in the Sanity Studio.
          </p>
          <Link
            href="/studio"
            target="_blank"
            className="mt-4 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
          >
            Open Sanity Studio
          </Link>
        </div>
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
                  Stock (Sanity)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Available (DB)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const inv = inventoryMap.get(product._id)
                const available = inv ? inv.quantityTotal - inv.quantityReserved : null
                const isOut = available !== null && available <= 0
                const isLow = available !== null && !isOut && inv && available <= inv.lowStockThreshold

                const thumbUrl = product.imageUrl ?? null

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {thumbUrl ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={thumbUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">{product._id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        &euro;{product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="ml-1 text-xs text-gray-400 line-through">
                          &euro;{product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {product.inStock ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          In stock
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          Out of stock
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      {inv === undefined ? (
                        <span className="text-xs text-gray-400">Not tracked</span>
                      ) : (
                        <span
                          className={`text-sm font-medium ${
                            isOut
                              ? 'text-red-600'
                              : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                          }`}
                        >
                          {available}
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            / {inv!.quantityTotal}
                          </span>
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/admin/products`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        View in Products
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
