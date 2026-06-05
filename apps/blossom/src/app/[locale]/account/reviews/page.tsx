import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('myReviews') }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default async function AccountReviewsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const t = await getTranslations('Account')
  const locale = await getLocale()

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-gray-900">{t('myReviews')}</h2>
        <div className="rounded-xl border border-cream-dark bg-white px-6 py-16 text-center">
          <Star className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-900">{t('reviewsEmpty')}</p>
          <p className="mt-1 text-sm text-warm-gray">{t('reviewsEmptyDesc')}</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-charcoal px-5 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
          >
            {t('reviewsGoShopping')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-900">{t('myReviews')}</h2>
      <p className="text-sm text-warm-gray">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-cream-dark bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StarDisplay rating={review.rating} />
                  {review.isVerified && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Verified
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="text-sm font-medium text-gray-900">{review.title}</p>
                )}
                <p className="mt-1 text-sm text-warm-gray leading-relaxed">{review.body}</p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    review.isApproved
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {review.isApproved ? t('reviewsApproved') : t('reviewsPending')}
                </span>
                <p className="mt-1 text-xs text-warm-gray">
                  {format(review.createdAt, 'd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
