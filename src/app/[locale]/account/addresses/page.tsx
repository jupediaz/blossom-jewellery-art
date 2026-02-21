'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { MapPin, Plus, Trash2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Address {
  id: string
  label: string | null
  firstName: string
  lastName: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
}

export default function AddressesPage() {
  const router = useRouter()
  const t = useTranslations('Account')
  const tc = useTranslations('Common')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/account/addresses')
      .then((r) => r.json())
      .then(setAddresses)
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      label: form.get('label') || null,
      firstName: form.get('firstName'),
      lastName: form.get('lastName'),
      line1: form.get('line1'),
      line2: form.get('line2') || null,
      city: form.get('city'),
      state: form.get('state') || null,
      postalCode: form.get('postalCode'),
      country: form.get('country'),
      phone: form.get('phone') || null,
      isDefault: form.get('isDefault') === 'true',
    }

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed')

      const address = await res.json()
      setAddresses((prev) => [...prev, address])
      setShowForm(false)
      router.refresh()
    } catch {
      setError(t('failedToSave'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' })
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">{t('savedAddresses')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          <Plus className="h-4 w-4" />
          {t('addAddress')}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 p-4"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('label')}</label>
              <input
                name="label"
                placeholder={t('labelPlaceholder')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              />
            </div>
            <div />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('firstName')}</label>
              <input name="firstName" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('lastName')}</label>
              <input name="lastName" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('addressLine1')}</label>
            <input name="line1" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('addressLine2')}</label>
            <input name="line2" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('city')}</label>
              <input name="city" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('postalCode')}</label>
              <input name="postalCode" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('country')}</label>
              <select name="country" required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal">
                <option value="">{t('selectCountry')}</option>
                <option value="ES">Spain</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="PT">Portugal</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="AT">Austria</option>
                <option value="IE">Ireland</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="UA">Ukraine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('phone')}</label>
            <input name="phone" type="tel" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal" />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input name="isDefault" type="checkbox" value="true" className="rounded" />
              {t('setAsDefault')}
            </label>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-charcoal px-6 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('saveAddress')}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MapPin className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noAddresses')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('addressFasterCheckout')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="relative rounded-xl border border-gray-200 p-4"
            >
              {addr.isDefault && (
                <span className="absolute right-3 top-3 rounded-full bg-charcoal px-2 py-0.5 text-xs text-white">
                  {t('defaultLabel')}
                </span>
              )}
              {addr.label && (
                <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                  {addr.label}
                </p>
              )}
              <p className="text-sm font-medium text-gray-900">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="text-sm text-gray-600">{addr.line1}</p>
              {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.postalCode}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>
              {addr.phone && (
                <p className="mt-1 text-xs text-gray-400">{addr.phone}</p>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                {tc('delete')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
