'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from '@/i18n/navigation'
import { MapPin, Plus, Trash2, Pencil, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

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

const COUNTRY_CODES = ['ES', 'DE', 'FR', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE', 'GB', 'US', 'UA']

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal'

export default function AddressesPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Account')
  const tc = useTranslations('Common')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // Use browser Intl.DisplayNames to get localized country names — zero translation keys needed
  const countryNames = useMemo(() => {
    const dn = new Intl.DisplayNames([locale], { type: 'region' })
    return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code }))
  }, [locale])

  useEffect(() => {
    fetch('/api/account/addresses')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then(setAddresses)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) : null

  function openNewForm() {
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  function openEditForm(id: string) {
    setEditingId(id)
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

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
      if (editingId) {
        const res = await fetch('/api/account/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...data }),
        })
        if (!res.ok) throw new Error('Failed')
        const updated = await res.json()
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
      } else {
        const res = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed')
        const address = await res.json()
        setAddresses((prev) => [...prev, address])
      }
      closeForm()
      router.refresh()
    } catch {
      setError(t('failedToSave'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError('')
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setDeleteError(t('failedToDelete'))
      return
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) closeForm()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <p className="text-sm text-gray-500">{t('loadError')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">{t('savedAddresses')}</h2>
        <button
          onClick={openNewForm}
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
          <h3 className="text-sm font-medium text-gray-900">
            {editingId ? t('editAddress') : t('addAddress')}
          </h3>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('label')}</label>
              <input
                name="label"
                placeholder={t('labelPlaceholder')}
                defaultValue={editingAddress?.label ?? ''}
                className={inputCls}
              />
            </div>
            <div />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('firstName')}</label>
              <input name="firstName" required defaultValue={editingAddress?.firstName ?? ''} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('lastName')}</label>
              <input name="lastName" required defaultValue={editingAddress?.lastName ?? ''} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('addressLine1')}</label>
            <input name="line1" required defaultValue={editingAddress?.line1 ?? ''} className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('addressLine2')}</label>
            <input name="line2" defaultValue={editingAddress?.line2 ?? ''} className={inputCls} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('city')}</label>
              <input name="city" required defaultValue={editingAddress?.city ?? ''} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('stateProvince')}</label>
              <input name="state" defaultValue={editingAddress?.state ?? ''} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('postalCode')}</label>
              <input name="postalCode" required defaultValue={editingAddress?.postalCode ?? ''} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('country')}</label>
              <select name="country" required defaultValue={editingAddress?.country ?? ''} className={inputCls}>
                <option value="">{t('selectCountry')}</option>
                {countryNames.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('phone')}</label>
            <input name="phone" type="tel" defaultValue={editingAddress?.phone ?? ''} className={inputCls} />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                name="isDefault"
                type="checkbox"
                value="true"
                defaultChecked={editingAddress?.isDefault ?? false}
                className="rounded"
              />
              {t('setAsDefault')}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {tc('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-charcoal px-6 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? t('updateAddress') : t('saveAddress')}
              </button>
            </div>
          </div>
        </form>
      )}

      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
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
              className={`relative rounded-xl border p-4 ${editingId === addr.id ? 'border-charcoal' : 'border-gray-200'}`}
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
                {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
              </p>
              <p className="text-sm text-gray-600">{addr.country}</p>
              {addr.phone && (
                <p className="mt-1 text-xs text-gray-400">{addr.phone}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => openEditForm(addr.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-charcoal"
                >
                  <Pencil className="h-3 w-3" />
                  {tc('edit')}
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  {tc('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
