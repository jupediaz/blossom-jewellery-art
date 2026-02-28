'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      type: form.get('type') as string,
      discountType: form.get('discountType') as string,
      discountValue: Number(form.get('discountValue')),
      applyToAll: form.get('applyToAll') === 'true',
      validFrom: new Date(form.get('validFrom') as string).toISOString(),
      validUntil: new Date(form.get('validUntil') as string).toISOString(),
      badgeText: (form.get('badgeText') as string) || null,
      bannerText: (form.get('bannerText') as string) || null,
    }

    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create offer')
      router.push('/admin/offers')
      router.refresh()
    } catch {
      setError('Failed to create offer')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/offers" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-900">Create Offer</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input name="name" required placeholder="Spring Collection Sale" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Offer Type</label>
            <select name="type" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal">
              <option value="FLASH_SALE">Flash Sale</option>
              <option value="LAUNCH_OFFER">Launch Offer</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="COLLECTION_SALE">Collection Sale</option>
              <option value="CLEARANCE">Clearance</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Discount Type</label>
            <select name="discountType" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Discount Value</label>
            <input name="discountValue" type="number" step="0.01" required placeholder="20" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Apply To</label>
            <select name="applyToAll" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal">
              <option value="true">All Products</option>
              <option value="false">Specific Products/Collections</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input name="validFrom" type="date" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
            <input name="validUntil" type="date" required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Badge Text</label>
            <input name="badgeText" placeholder="SALE, -20%, LAUNCH" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Text</label>
            <input name="bannerText" placeholder="Spring Sale - Up to 20% off!" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Offer
        </button>
      </form>
    </div>
  )
}
