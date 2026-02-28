'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      code: (form.get('code') as string).toUpperCase().trim(),
      type: form.get('type') as string,
      value: Number(form.get('value')),
      minOrderValue: form.get('minOrderValue') ? Number(form.get('minOrderValue')) : null,
      maxDiscountAmount: form.get('maxDiscountAmount') ? Number(form.get('maxDiscountAmount')) : null,
      maxUses: form.get('maxUses') ? Number(form.get('maxUses')) : null,
      maxUsesPerCustomer: Number(form.get('maxUsesPerCustomer') || 1),
      validFrom: new Date().toISOString(),
      validUntil: form.get('validUntil') ? new Date(form.get('validUntil') as string).toISOString() : null,
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create coupon')
      }
      router.push('/admin/coupons')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">Create Coupon</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Code</label>
            <input
              name="code"
              required
              placeholder="WELCOME10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (EUR)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Value</label>
            <input
              name="value"
              type="number"
              step="0.01"
              required
              placeholder="10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Min Order Value (EUR)</label>
            <input
              name="minOrderValue"
              type="number"
              step="0.01"
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Uses</label>
            <input
              name="maxUses"
              type="number"
              placeholder="Unlimited"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Per Customer</label>
            <input
              name="maxUsesPerCustomer"
              type="number"
              defaultValue={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount (EUR)</label>
            <input
              name="maxDiscountAmount"
              type="number"
              step="0.01"
              placeholder="No cap"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Expires</label>
          <input
            name="validUntil"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
          <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Coupon
        </button>
      </form>
    </div>
  )
}
