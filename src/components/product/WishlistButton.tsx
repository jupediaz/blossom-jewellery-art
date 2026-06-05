'use client'

import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  variant?: string
  className?: string
}

export function WishlistButton({ productId, variant, className }: WishlistButtonProps) {
  const t = useTranslations('Products')
  const tAccount = useTranslations('Account')
  const tc = useTranslations('Common')
  const locale = useLocale()
  const { status } = useSession()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/account/wishlist')
      .then((res) => {
        if (!res.ok) return []
        return res.json()
      })
      .then((items: { id: string; sanityProductId: string; variantName: string | null }[]) => {
        if (Array.isArray(items)) {
          const match = items.find(
            (item) =>
              item.sanityProductId === productId &&
              (item.variantName || null) === (variant || null)
          )
          setIsInWishlist(!!match)
          setWishlistItemId(match?.id ?? null)
        }
      })
      .catch(() => {})
  }, [productId, variant, status])

  const toggle = async () => {
    setLoading(true)
    try {
      if (isInWishlist && wishlistItemId) {
        await fetch(`/api/account/wishlist?id=${wishlistItemId}`, { method: 'DELETE' })
        setIsInWishlist(false)
        setWishlistItemId(null)
      } else if (!isInWishlist) {
        const res = await fetch('/api/account/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sanityProductId: productId, variantName: variant }),
        })
        if (res.status === 401) {
          setShowAuthModal(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          setIsInWishlist(true)
          setWishlistItemId(data.id ?? null)
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const pathname = usePathname()
  const loginBase = locale === 'en' ? '/login' : `/${locale}/login`
  const loginHref = `${loginBase}?callbackUrl=${encodeURIComponent(pathname)}`

  return (
    <>
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          'p-2 rounded-full transition-colors',
          isInWishlist
            ? 'text-dusty-rose hover:text-dusty-rose-dark'
            : 'text-warm-gray hover:text-charcoal',
          className
        )}
        aria-label={isInWishlist ? t('removeFromWishlist') : t('addToWishlist')}
        title={isInWishlist ? t('removeFromWishlist') : t('addToWishlist')}
      >
        <Heart
          size={20}
          className={cn(loading && 'animate-pulse')}
          fill={isInWishlist ? 'currentColor' : 'none'}
        />
      </button>

      {showAuthModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-cream rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-light">{t('addToWishlist')}</h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 text-warm-gray hover:text-charcoal transition-colors"
                aria-label={tc('close')}
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-warm-gray mb-6">{tAccount('signInSubtitle')}</p>
            <div className="flex flex-col gap-3">
              <a
                href={loginHref}
                className="block w-full bg-charcoal text-cream text-center py-2.5 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
              >
                {tAccount('signIn')}
              </a>
              <button
                onClick={() => setShowAuthModal(false)}
                className="block w-full border border-cream-dark text-charcoal text-center py-2.5 rounded text-sm tracking-wide hover:border-charcoal transition-colors"
              >
                {tc('cancel')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
