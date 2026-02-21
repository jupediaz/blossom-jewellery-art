import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { sanityFetch } from '@/lib/sanity/client'
import { Heart } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { WishlistRemoveButton } from './WishlistRemoveButton'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('wishlist') }
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/account/login')

  const t = await getTranslations('Account')
  const tc = await getTranslations('Common')

  const wishlistItems = await db.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noWishlist')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('saveFavoritesLater')}
        </p>
        <Link
          href="/products"
          className="mt-6 rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          {t('browseProducts')}
        </Link>
      </div>
    )
  }

  // Fetch product details from Sanity for wishlist items
  const productIds = wishlistItems.map((w) => w.sanityProductId)
  const products = await sanityFetch<
    Array<{
      _id: string
      name: string
      slug: { current: string }
      price: number
      imageUrl?: string
      inStock: boolean
    }>
  >(
    `*[_type == "product" && _id in $ids] {
      _id, name, slug, price, inStock,
      "imageUrl": images[0].asset->url
    }`,
    { ids: productIds }
  )

  const productMap = new Map(products.map((p) => [p._id, p]))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900">
        {t('wishlistCount', { count: wishlistItems.length })}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => {
          const product = productMap.get(item.sanityProductId)
          if (!product) return null

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200"
            >
              <Link href={`/products/${product.slug.current}`}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gray-100">
                    <Heart className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </Link>
              <div className="p-3">
                <Link href={`/products/${product.slug.current}`}>
                  <p className="text-sm font-medium text-gray-900 hover:underline">
                    {product.name}
                  </p>
                </Link>
                {item.variantName && (
                  <p className="text-xs text-gray-500">{item.variantName}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    &euro;{product.price}
                  </span>
                  {!product.inStock && (
                    <span className="text-xs text-red-500">{tc('outOfStock')}</span>
                  )}
                </div>
                <WishlistRemoveButton wishlistId={item.id} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
