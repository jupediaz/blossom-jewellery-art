'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('Account')
  const tc = useTranslations('Common')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string
    const email = form.get('email') as string
    const password = form.get('password') as string
    const confirmPassword = form.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError(t('passwordsMismatch'))
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError(t('passwordMinLength'))
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t('registrationFailed'))
        setLoading(false)
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('accountCreatedSignInFailed'))
        setLoading(false)
      } else {
        router.push('/account')
        router.refresh()
      }
    } catch {
      setError(tc('error'))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-light tracking-tight text-gray-900">
            {t('register')}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t('registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('name')}</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('email')}</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('password')}</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('confirmPassword')}</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('register')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {t('hasAccount')}{' '}
          <Link href="/account/login" className="font-medium text-charcoal hover:underline">
            {t('signInLink')}
          </Link>
        </p>
      </div>
    </div>
  )
}
