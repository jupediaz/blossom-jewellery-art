'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl mb-4">Something went wrong</h1>
        <p className="text-charcoal/60 mb-8">
          We apologize for the inconvenience. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-charcoal text-cream px-6 py-3 rounded hover:bg-charcoal/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
