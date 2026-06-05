'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Offer {
  id: string
  name: string
  type: string
  discountType: string
  discountValue: number
  validFrom: string
  validUntil: string
  isActive: boolean
  bannerText: string | null
  badgeText: string | null
  applyToAll: boolean
}

export default function EditOfferPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/offers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.offer) setOffer(data.offer)
        else setError('Offer not found')
      })
      .catch(() => setError('Failed to load offer'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      discountType: form.get('discountType') as string,
      discountValue: Number(form.get('discountValue')),
      validFrom: new Date(form.get('validFrom') as string).toISOString(),
      validUntil: new Date(form.get('validUntil') as string).toISOString(),
      isActive: form.get('isActive') === 'on',
      bannerText: (form.get('bannerText') as string) || null,
      badgeText: (form.get('badgeText') as string) || null,
    }

    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update')
      }
      router.push('/admin/offers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  if (!offer) return <div className="text-center py-16 text-red-600">{error || 'Offer not found'}</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/offers" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Edit Offer</h2>
          <p className="text-sm text-gray-500">{offer.type.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            required
            defaultValue={offer.name}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
            <select
              name="discountType"
              defaultValue={offer.discountType}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (EUR)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Value</label>
            <input
              name="discountValue"
              type="number"
              step="0.01"
              required
              defaultValue={offer.discountValue}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Valid From</label>
            <input
              name="validFrom"
              type="date"
              required
              defaultValue={format(new Date(offer.validFrom), 'yyyy-MM-dd')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Valid Until</label>
            <input
              name="validUntil"
              type="date"
              required
              defaultValue={format(new Date(offer.validUntil), 'yyyy-MM-dd')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Text</label>
            <input
              name="bannerText"
              defaultValue={offer.bannerText ?? ''}
              placeholder="e.g. Summer Sale — 20% Off"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Badge Text</label>
            <input
              name="badgeText"
              defaultValue={offer.badgeText ?? ''}
              placeholder="e.g. SALE"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={offer.isActive}
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
          <Link href="/admin/offers" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
