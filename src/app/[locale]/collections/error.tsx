'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'

export default function CollectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Common')
  const router = useRouter()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className="font-heading text-3xl mb-4">{t('error')}</h1>
      <p className="text-charcoal/60 mb-8 max-w-md mx-auto">{t('errorDescription')}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-charcoal text-cream px-6 py-3 rounded hover:bg-charcoal/90 transition-colors text-sm"
        >
          {t('tryAgain')}
        </button>
        <button
          onClick={() => router.push('/')}
          className="border border-cream-dark text-charcoal px-6 py-3 rounded hover:border-charcoal transition-colors text-sm"
        >
          {t('backToHome')}
        </button>
      </div>
    </div>
  )
}
