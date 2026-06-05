'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const tc = useTranslations('Common')
  const router = useRouter()

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl mb-4">{tc('error')}</h1>
        <p className="text-charcoal/60 mb-8">
          {tc('errorDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-charcoal text-cream px-6 py-3 rounded hover:bg-charcoal/90 transition-colors text-sm"
          >
            {tc('tryAgain')}
          </button>
          <button
            onClick={() => router.push('/')}
            className="border border-cream-dark text-charcoal px-6 py-3 rounded hover:border-charcoal transition-colors text-sm"
          >
            {tc('backToHome')}
          </button>
          <button
            onClick={() => router.push('/products')}
            className="border border-cream-dark text-charcoal px-6 py-3 rounded hover:border-charcoal transition-colors text-sm"
          >
            {tc('continueShopping')}
          </button>
        </div>
      </div>
    </div>
  )
}
