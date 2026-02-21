'use client'

import { useState, useEffect } from 'react'
import { Truck, Plus, Loader2, Pencil, Trash2, X, Check } from 'lucide-react'

interface ShippingMethod {
  id: string
  name: string
  rate: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  isActive: boolean
}

interface ShippingZone {
  id: string
  name: string
  countries: string[]
  freeShippingThreshold: number | null
  isActive: boolean
  methods: ShippingMethod[]
}

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddZone, setShowAddZone] = useState(false)
  const [addingMethod, setAddingMethod] = useState<string | null>(null)

  useEffect(() => {
    fetchZones()
  }, [])

  async function fetchZones() {
    const res = await fetch('/api/admin/shipping/zones')
    const data = await res.json()
    setZones(data)
    setLoading(false)
  }

  async function toggleZone(id: string, isActive: boolean) {
    await fetch(`/api/admin/shipping/zones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchZones()
  }

  async function deleteZone(id: string) {
    if (!confirm('Delete this shipping zone? This cannot be undone.')) return
    const res = await fetch(`/api/admin/shipping/zones/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Failed to delete zone')
      return
    }
    fetchZones()
  }

  async function toggleMethod(id: string, isActive: boolean) {
    await fetch(`/api/admin/shipping/methods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchZones()
  }

  async function deleteMethod(id: string) {
    if (!confirm('Delete this shipping method?')) return
    const res = await fetch(`/api/admin/shipping/methods/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Failed to delete method')
      return
    }
    fetchZones()
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
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Shipping Zones</h2>
          <p className="text-sm text-gray-500">{zones.length} zones configured</p>
        </div>
        <button
          onClick={() => setShowAddZone(true)}
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          <Plus className="h-4 w-4" />
          Add Zone
        </button>
      </div>

      {showAddZone && (
        <AddZoneForm
          onSave={() => { setShowAddZone(false); fetchZones() }}
          onCancel={() => setShowAddZone(false)}
        />
      )}

      {zones.length === 0 && !showAddZone ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <Truck className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="font-medium text-gray-900">No shipping zones</p>
          <p className="mt-1 text-sm text-gray-500">
            Add shipping zones to enable shipping rate calculation at checkout
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{zone.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {zone.countries.length > 8
                        ? `${zone.countries.slice(0, 8).join(', ')} +${zone.countries.length - 8} more`
                        : zone.countries.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {zone.freeShippingThreshold !== null && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Free over &euro;{zone.freeShippingThreshold}
                      </span>
                    )}
                    <button
                      onClick={() => toggleZone(zone.id, zone.isActive)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        zone.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-medium uppercase text-gray-500">
                      <th className="py-2 text-left">Method</th>
                      <th className="py-2 text-center">Rate</th>
                      <th className="py-2 text-center">Delivery</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {zone.methods.map((method) => (
                      <tr key={method.id}>
                        <td className="py-2 text-sm font-medium text-gray-900">{method.name}</td>
                        <td className="py-2 text-center text-sm">&euro;{method.rate.toFixed(2)}</td>
                        <td className="py-2 text-center text-sm text-gray-500">
                          {method.estimatedDaysMin}-{method.estimatedDaysMax} days
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleMethod(method.id, method.isActive)}
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                method.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {method.isActive ? 'Active' : 'Off'}
                            </button>
                            <button
                              onClick={() => deleteMethod(method.id)}
                              className="rounded p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {addingMethod === zone.id ? (
                  <AddMethodForm
                    zoneId={zone.id}
                    onSave={() => { setAddingMethod(null); fetchZones() }}
                    onCancel={() => setAddingMethod(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingMethod(zone.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                    Add method
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddZoneForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [countries, setCountries] = useState('')
  const [freeThreshold, setFreeThreshold] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const countryList = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)

    await fetch('/api/admin/shipping/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        countries: countryList,
        freeShippingThreshold: freeThreshold ? Number(freeThreshold) : null,
      }),
    })

    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">New Shipping Zone</h3>
        <button type="button" onClick={onCancel} className="rounded p-1 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Zone Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Europe, UK, Americas"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Country Codes (comma-separated)</label>
          <input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="ES, FR, DE, IT"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Free Shipping Threshold (&euro;)</label>
          <input
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(e.target.value)}
            type="number"
            step="0.01"
            placeholder="60.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Create Zone
        </button>
      </div>
    </form>
  )
}

function AddMethodForm({
  zoneId,
  onSave,
  onCancel,
}: {
  zoneId: string
  onSave: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [daysMin, setDaysMin] = useState('')
  const [daysMax, setDaysMax] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await fetch('/api/admin/shipping/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zoneId,
        name,
        rate: Number(rate),
        estimatedDaysMin: Number(daysMin),
        estimatedDaysMax: Number(daysMax),
      }),
    })

    onSave()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3 border-t border-gray-100 pt-3">
      <div className="flex-1">
        <label className="mb-1 block text-xs text-gray-500">Method</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Standard"
          required
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-charcoal focus:outline-none"
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs text-gray-500">Rate (&euro;)</label>
        <input
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          type="number"
          step="0.01"
          placeholder="5.00"
          required
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-charcoal focus:outline-none"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-xs text-gray-500">Min days</label>
        <input
          value={daysMin}
          onChange={(e) => setDaysMin(e.target.value)}
          type="number"
          placeholder="3"
          required
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-charcoal focus:outline-none"
        />
      </div>
      <div className="w-20">
        <label className="mb-1 block text-xs text-gray-500">Max days</label>
        <input
          value={daysMax}
          onChange={(e) => setDaysMax(e.target.value)}
          type="number"
          placeholder="7"
          required
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-charcoal focus:outline-none"
        />
      </div>
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-charcoal p-1.5 text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onCancel} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
