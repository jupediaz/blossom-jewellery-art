'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function CheckoutError({
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
        <h1 className="font-heading text-3xl mb-4">Checkout unavailable</h1>
        <p className="text-charcoal/60 mb-8">
          We were unable to process your checkout. Your cart has not been
          charged. Please try again or return to your cart.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-charcoal text-cream px-6 py-3 rounded hover:bg-charcoal/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/cart"
            className="border border-charcoal text-charcoal px-6 py-3 rounded hover:bg-charcoal/5 transition-colors"
          >
            Return to cart
          </Link>
        </div>
      </div>
    </div>
  )
}
