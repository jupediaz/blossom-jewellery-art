'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'

interface Review {
  id: string
  authorName: string
  rating: number
  title: string | null
  body: string
  isVerified: boolean
  createdAt: string
}

interface ReviewData {
  reviews: Review[]
  total: number
  page: number
  pages: number
  averageRating: number | null
  totalCount: number
  ratingCounts: Record<string, number>
}

interface ReviewListProps {
  productId: string
  locale: string
}

export default function ReviewList({ productId, locale }: ReviewListProps) {
  const t = useTranslations('Reviews')
  const [data, setData] = useState<ReviewData | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&page=${p}&limit=5`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { load(page) }, [load, page])

  if (loading && !data) {
    return <div className="h-32 animate-pulse rounded bg-cream-dark/30" />
  }

  const avg = data?.averageRating
  const total = data?.totalCount ?? 0

  return (
    <section className="mt-12 border-t border-cream-dark pt-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl mb-1">{t('title')}</h2>
          {avg !== null && avg !== undefined && total > 0 ? (
            <div className="flex items-center gap-2">
              <StarRating value={avg} />
              <span className="text-sm text-warm-gray">
                {avg.toFixed(1)} · {t('reviewCount', { count: total })}
              </span>
            </div>
          ) : (
            <p className="text-sm text-warm-gray">{t('noReviews')}</p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm border border-charcoal text-charcoal px-4 py-2 rounded hover:bg-charcoal hover:text-cream transition-colors"
        >
          {showForm ? t('cancel') : t('writeReview')}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 rounded-lg border border-cream-dark bg-cream/30">
          <ReviewForm
            productId={productId}
            onSubmitted={() => { setShowForm(false); load(1) }}
          />
        </div>
      )}

      {data && data.reviews.length > 0 ? (
        <div className="space-y-6">
          {data.reviews.map((review) => (
            <div key={review.id} className="border-b border-cream-dark pb-6 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.authorName}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-sage-dark">
                        <CheckCircle2 size={12} />
                        {t('verifiedPurchase')}
                      </span>
                    )}
                  </div>
                  <StarRating value={review.rating} size={14} />
                </div>
                <time className="text-xs text-warm-gray/60">
                  {new Date(review.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
              <p className="text-sm text-charcoal/80 leading-relaxed">{review.body}</p>
            </div>
          ))}

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-sm text-warm-gray hover:text-charcoal disabled:opacity-30 transition-colors"
              >
                ← {t('previous')}
              </button>
              <span className="text-xs text-warm-gray">{page} / {data.pages}</span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-sm text-warm-gray hover:text-charcoal disabled:opacity-30 transition-colors"
              >
                {t('next')} →
              </button>
            </div>
          )}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8">
            <p className="text-warm-gray text-sm mb-3">{t('beFirst')}</p>
          </div>
        )
      )}
    </section>
  )
}
