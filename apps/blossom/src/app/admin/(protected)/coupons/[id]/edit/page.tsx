'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Coupon {
  id: string
  code: string
  type: string
  value: number
  minOrderValue: number | null
  maxDiscountAmount: number | null
  maxUses: number | null
  maxUsesPerCustomer: number
  validUntil: string | null
  isActive: boolean
}

export default function EditCouponPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/coupons/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.coupon) setCoupon(data.coupon)
        else setError('Coupon not found')
      })
      .catch(() => setError('Failed to load coupon'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      type: form.get('type') as string,
      value: Number(form.get('value')),
      minOrderValue: form.get('minOrderValue') ? Number(form.get('minOrderValue')) : null,
      maxDiscountAmount: form.get('maxDiscountAmount') ? Number(form.get('maxDiscountAmount')) : null,
      maxUses: form.get('maxUses') ? Number(form.get('maxUses')) : null,
      maxUsesPerCustomer: Number(form.get('maxUsesPerCustomer') || 1),
      validUntil: form.get('validUntil') ? new Date(form.get('validUntil') as string).toISOString() : null,
      isActive: form.get('isActive') === 'on',
    }

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update')
      }
      router.push('/admin/coupons')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update coupon')
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  if (!coupon) return <div className="text-center py-16 text-red-600">{error || 'Coupon not found'}</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Coupon</h2>
          <p className="text-sm text-gray-500 font-mono">{coupon.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              defaultValue={coupon.type}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (EUR)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Value</label>
            <input
              name="value"
              type="number"
              step="0.01"
              required
              defaultValue={coupon.value}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Min Order Value (EUR)</label>
            <input
              name="minOrderValue"
              type="number"
              step="0.01"
              defaultValue={coupon.minOrderValue ?? ''}
              placeholder="Optional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Discount (EUR)</label>
            <input
              name="maxDiscountAmount"
              type="number"
              step="0.01"
              defaultValue={coupon.maxDiscountAmount ?? ''}
              placeholder="No cap"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Max Total Uses</label>
            <input
              name="maxUses"
              type="number"
              defaultValue={coupon.maxUses ?? ''}
              placeholder="Unlimited"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Per Customer</label>
            <input
              name="maxUsesPerCustomer"
              type="number"
              defaultValue={coupon.maxUsesPerCustomer}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Expires</label>
          <input
            name="validUntil"
            type="date"
            defaultValue={coupon.validUntil ? format(new Date(coupon.validUntil), 'yyyy-MM-dd') : ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={coupon.isActive}
            className="h-4 w-4 rounded border-gray-300 text-charcoal focus:ring-charcoal"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
          <Link href="/admin/coupons" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
