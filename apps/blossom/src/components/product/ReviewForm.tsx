'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import StarRating from './StarRating'

interface ReviewFormProps {
  productId: string
  onSubmitted?: () => void
}

export default function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const t = useTranslations('Reviews')
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError(t('ratingRequired')); return }
    if (body.trim().length < 10) { setError(t('bodyTooShort')); return }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body, authorName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t('submitError')); return }
      setDone(true)
      onSubmitted?.()
    } catch {
      setError(t('submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-sage/30 bg-sage/5 p-4 text-sm text-sage-dark">
        {t('submitted')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-heading text-lg">{t('writeReview')}</h3>

      <div>
        <p className="text-sm text-warm-gray mb-1">{t('yourRating')}</p>
        <StarRating value={rating} interactive onChange={setRating} size={22} />
      </div>

      <div>
        <label className="block text-sm text-warm-gray mb-1">{t('name')}</label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder={t('namePlaceholder')}
          className="w-full border border-cream-dark rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
        />
      </div>

      <div>
        <label className="block text-sm text-warm-gray mb-1">{t('titleOptional')}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          maxLength={120}
          className="w-full border border-cream-dark rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
        />
      </div>

      <div>
        <label className="block text-sm text-warm-gray mb-1">{t('review')}</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('reviewPlaceholder')}
          rows={4}
          required
          className="w-full border border-cream-dark rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-charcoal text-cream px-6 py-2.5 rounded text-sm hover:bg-charcoal/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
