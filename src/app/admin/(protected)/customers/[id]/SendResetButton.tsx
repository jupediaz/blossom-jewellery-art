'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Check } from 'lucide-react'

export function SendResetButton({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/reset-password`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600">
        <Check size={12} /> Reset email sent
      </p>
    )
  }

  return (
    <div className="mt-3">
      <button
        onClick={handleReset}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
        Send password reset email
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
