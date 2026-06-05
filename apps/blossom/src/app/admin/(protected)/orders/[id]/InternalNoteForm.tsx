'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, StickyNote } from 'lucide-react'

interface InternalNoteFormProps {
  orderId: string
  initialNote: string | null
}

export function InternalNoteForm({ orderId, initialNote }: InternalNoteFormProps) {
  const router = useRouter()
  const [note, setNote] = useState(initialNote ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNote: note }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save note')
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="flex items-center gap-2 font-medium text-gray-900">
          <StickyNote className="h-4 w-4 text-amber-500" />
          Internal Note
        </h3>
        <p className="mt-0.5 text-xs text-gray-400">Visible to staff only, never shown to customers</p>
      </div>
      <div className="px-6 py-4 space-y-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Add an internal note about this order..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal resize-none"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {saved && <p className="text-xs text-emerald-600">Note saved</p>}
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save Note
        </button>
      </div>
    </div>
  )
}
