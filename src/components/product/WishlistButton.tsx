'use client'

import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  variant?: string
  className?: string
}

export function WishlistButton({ productId, variant, className }: WishlistButtonProps) {
  const t = useTranslations('Products')
  const tAuth = useTranslations('Auth')
  const tc = useTranslations('Common')
  const locale = useLocale()
  const { status } = useSession()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Only check wishlist if user is authenticated
    if (status !== 'authenticated') return
    fetch('/api/account/wishlist')
      .then((res) => {
        if (!res.ok) return [] // Not authenticated
        return res.json()
      })
      .then((items: { sanityProductId: string; variantName: string | null }[]) => {
        if (Array.isArray(items)) {
          setIsInWishlist(
            items.some(
              (item) =>
                item.sanityProductId === productId &&
                (item.variantName || null) === (variant || null)
            )
          )
        }
      })
      .catch(() => {})
  }, [productId, variant, status])

  const toggle = async () => {
    setLoading(true)
    try {
      if (isInWishlist) {
        // Find the item ID first, then delete
        const res = await fetch('/api/account/wishlist')
        if (!res.ok) return
        const items: { id: string; sanityProductId: string; variantName: string | null }[] = await res.json()
        const item = items.find(
          (i) =>
            i.sanityProductId === productId &&
            (i.variantName || null) === (variant || null)
        )
        if (item) {
          await fetch(`/api/account/wishlist?id=${item.id}`, { method: 'DELETE' })
          setIsInWishlist(false)
        }
      } else {
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
          setIsInWishlist(true)
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const loginHref = locale === 'en' ? '/login' : `/${locale}/login`

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
            <p className="text-sm text-warm-gray mb-6">{tAuth('signInSubtitle')}</p>
            <div className="flex flex-col gap-3">
              <a
                href={loginHref}
                className="block w-full bg-charcoal text-cream text-center py-2.5 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
              >
                {tAuth('signIn')}
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
