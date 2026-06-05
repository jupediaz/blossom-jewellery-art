'use client'

import { useRouter } from 'next/navigation'

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 365, label: '1y' },
]

export function DateRangeSelector({ currentDays }: { currentDays: number }) {
  const router = useRouter()

  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 gap-1">
      {RANGES.map(({ days, label }) => (
        <button
          key={days}
          onClick={() => router.push(`/admin/analytics?days=${days}`)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            currentDays === days
              ? 'bg-charcoal text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
