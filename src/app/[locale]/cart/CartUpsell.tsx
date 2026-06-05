'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'

type UpsellProduct = {
  _id: string
  name: string
  slug: { current: string }
  price: number
  compareAtPrice?: number
  imageUrl: string | null
}

export function CartUpsell() {
  const t = useTranslations('Cart')
  const locale = useLocale()
  const { items, addItem } = useCartStore()
  const [products, setProducts] = useState<UpsellProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return }
    const exclude = items.map((i) => i.id).join(',')
    fetch(`/api/products/upsell?exclude=${exclude}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: UpsellProduct[]) => setProducts(data.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // run once on mount — cart items don't change during upsell

  if (loading || products.length === 0) return null

  const localePath = (slug: string) => locale === 'en' ? `/products/${slug}` : `/${locale}/products/${slug}`

  return (
    <section className="mt-12 border-t border-cream-dark pt-10">
      <h2 className="mb-6 text-lg font-light tracking-wide text-charcoal">
        {t('youMayAlsoLike')}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <div key={product._id} className="group">
            <Link href={localePath(product.slug?.current ?? product._id)} className="block">
              <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-cream">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 45vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-warm-gray text-xs">No image</div>
                )}
              </div>
              <p className="text-sm font-medium text-charcoal line-clamp-1 group-hover:text-charcoal/80">
                {product.name}
              </p>
              <p className="mt-0.5 text-sm text-warm-gray">{formatPrice(product.price)}</p>
            </Link>
            <button
              onClick={() => addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.imageUrl ?? '',
                slug: product.slug?.current ?? '',
              })}
              className="mt-2 w-full rounded border border-charcoal py-1.5 text-xs tracking-wide text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
            >
              {t('addToCart')}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
