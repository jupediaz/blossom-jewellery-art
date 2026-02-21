'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  variant?: string
  className?: string
}

export function WishlistButton({ productId, variant, className }: WishlistButtonProps) {
  const t = useTranslations('Products')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if product is already in user's wishlist
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
  }, [productId, variant])

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
          // Not logged in — redirect to account login
          window.location.href = '/account/login'
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

  return (
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
  )
}
