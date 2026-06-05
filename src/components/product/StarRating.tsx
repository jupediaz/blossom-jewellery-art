'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number        // 0–5, can be fractional for display
  interactive?: boolean
  onChange?: (rating: number) => void
  size?: number
}

export default function StarRating({ value, interactive = false, onChange, size = 16 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          aria-label={interactive ? `Rate ${star} stars` : undefined}
        >
          <Star
            size={size}
            className={star <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-warm-gray/30'}
          />
        </button>
      ))}
    </div>
  )
}
