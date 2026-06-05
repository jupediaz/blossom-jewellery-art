'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Flower2, Loader2, ShieldCheck, Store } from 'lucide-react'

const QUICK_PROFILES = [
  {
    email: 'jose@blossombyolha.com',
    password: 'changeme-in-production',
    label: 'José',
    role: 'Admin',
    icon: ShieldCheck,
    color: 'bg-charcoal text-white hover:bg-charcoal/85',
  },
  {
    email: 'olha@blossombyolha.com',
    password: 'changeme-in-production',
    label: 'Olha',
    role: 'Store Owner',
    icon: Store,
    color: 'bg-sage text-white hover:bg-sage/85',
  },
] as const

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState<string | null>(null)

  const quickLoginEnabled = process.env.NEXT_PUBLIC_QUICK_LOGIN === 'true'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleQuickLogin(profile: (typeof QUICK_PROFILES)[number]) {
    setError('')
    setQuickLoading(profile.email)

    const result = await signIn('credentials', {
      email: profile.email,
      password: profile.password,
      redirect: false,
    })

    if (result?.error) {
      setError(`Could not sign in as ${profile.label}. Check that the account exists in the DB.`)
      setQuickLoading(null)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal">
            <Flower2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Blossom Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your store</p>
        </div>

        {quickLoginEnabled && (
          <div className="mb-6">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
              Quick Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROFILES.map((profile) => {
                const Icon = profile.icon
                const isLoading = quickLoading === profile.email
                return (
                  <button
                    key={profile.email}
                    type="button"
                    onClick={() => handleQuickLogin(profile)}
                    disabled={!!quickLoading || loading}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${profile.color}`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span>
                      {profile.label}
                      <span className="ml-1 text-[10px] font-normal opacity-75">
                        {profile.role}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">or sign in manually</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              placeholder="jose@blossombyolha.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!quickLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
