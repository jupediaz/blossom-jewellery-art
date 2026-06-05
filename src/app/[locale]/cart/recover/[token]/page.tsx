'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useTranslations } from 'next-intl'
import { Loader2, ShoppingBag } from 'lucide-react'

export default function CartRecoverPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const t = useTranslations('Cart')
  const router = useRouter()
  const { clearCart, addItem } = useCartStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function recover() {
      const { token } = await params
      try {
        const res = await fetch(`/api/cart/recover?token=${token}`)
        if (!res.ok) {
          setError(t('recoverExpired'))
          setLoading(false)
          return
        }

        const data = await res.json()

        // Restore cart items
        clearCart()
        for (const item of data.items) {
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || '',
            slug: item.slug || '',
            variant: item.variant,
          })
        }

        // Redirect to cart
        router.push('/cart')
      } catch {
        setError(t('recoverError'))
        setLoading(false)
      }
    }

    recover()
  }, [params, clearCart, addItem, router, t])

  if (loading && !error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">{t('recoverLoading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-xl font-light text-gray-900">
          {t('recoverTitle')}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          {t('browseProducts')}
        </Link>
      </div>
    </div>
  )
}
