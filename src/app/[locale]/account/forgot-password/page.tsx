'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('Account')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.status === 429) {
        setError('Too many requests. Please try again later.')
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            {t('resetEmailSent')}
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-charcoal hover:underline"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-tight text-gray-900">
            {t('resetPassword')}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t('forgotPassword')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('email')}
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('sendResetLink')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="font-medium text-charcoal hover:underline"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
