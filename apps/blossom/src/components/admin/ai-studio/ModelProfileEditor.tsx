'use client'

import { useState, useCallback } from 'react'
import { Save, Loader2, User } from 'lucide-react'
import { ImageDropzone } from './ImageDropzone'
import type { ReferenceImage, BrandModelProfileData } from '@/lib/ai/types'

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front' },
  { key: '3q-left', label: '3/4 Left' },
  { key: '3q-right', label: '3/4 Right' },
  { key: 'full-body', label: 'Full Body' },
  { key: 'other', label: 'Other' },
] as const

interface ModelProfileEditorProps {
  initialProfile: BrandModelProfileData | null
}

export function ModelProfileEditor({ initialProfile }: ModelProfileEditorProps) {
  const [name, setName] = useState(initialProfile?.name || 'Ola')
  const [notes, setNotes] = useState(initialProfile?.notes || '')
  const [photos, setPhotos] = useState<Record<string, ReferenceImage | null>>(() => {
    const map: Record<string, ReferenceImage | null> = {}
    for (const slot of PHOTO_SLOTS) {
      const existing = initialProfile?.referenceImages.find(
        (img) => img.filename?.startsWith(slot.key)
      )
      map[slot.key] = existing || null
    }
    return map
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const uploadedCount = Object.values(photos).filter(Boolean).length

  const handlePhotoUpload = useCallback(
    async (slotKey: string, file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('directory', 'model-profile')

      try {
        const res = await fetch('/api/ai/image/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        setPhotos((prev) => ({
          ...prev,
          [slotKey]: {
            path: data.path,
            type: 'person' as const,
            filename: `${slotKey}-${data.filename}`,
          },
        }))
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Upload failed')
      }
    },
    []
  )

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    const referenceImages = Object.values(photos).filter(Boolean) as ReferenceImage[]

    try {
      const res = await fetch('/api/ai/model-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialProfile?.id,
          name,
          referenceImages,
          notes: notes || null,
        }),
      })

      if (!res.ok) throw new Error('Save failed')
      setMessage('Profile saved successfully')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Brand Model Profile</h3>
            <p className="text-sm text-gray-500">
              {uploadedCount}/5 reference photos uploaded
            </p>
          </div>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        {/* Photo grid */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Reference Photos
          </label>
          <div className="grid grid-cols-5 gap-3">
            {PHOTO_SLOTS.map((slot) => {
              const photo = photos[slot.key]
              return (
                <div key={slot.key}>
                  <ImageDropzone
                    onImageSelect={(file) => handlePhotoUpload(slot.key, file)}
                    onClear={() =>
                      setPhotos((prev) => ({ ...prev, [slot.key]: null }))
                    }
                    preview={photo ? `/uploads/ai-studio/${photo.path}` : null}
                    compact
                    label={slot.label}
                  />
                  <p className="mt-1 text-center text-xs text-gray-500">{slot.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Hair color, preferred angles, style notes..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-purple-500 transition-all"
              style={{ width: `${(uploadedCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
