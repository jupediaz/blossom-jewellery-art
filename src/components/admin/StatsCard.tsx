import { type LucideIcon } from 'lucide-react'

export interface StatsCardProps {
  title?: string
  label?: string
  value: string | number
  change?: number | { value: number; label: string }
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, label, value, change, icon: Icon, trend }: StatsCardProps) {
  const displayTitle = title || label || ''

  // Normalize change prop
  let changeValue: number | undefined
  let changeLabel: string | undefined
  if (typeof change === 'number') {
    changeValue = change
    changeLabel = 'vs last period'
  } else if (change) {
    changeValue = change.value
    changeLabel = change.label
  }

  const effectiveTrend = trend || (changeValue !== undefined ? (changeValue > 0 ? 'up' : changeValue < 0 ? 'down' : 'neutral') : undefined)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{displayTitle}</p>
        <div className="rounded-lg bg-gray-50 p-2">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {changeValue !== undefined && (
        <p className="mt-1 text-sm">
          <span
            className={
              effectiveTrend === 'up'
                ? 'text-emerald-600'
                : effectiveTrend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
            }
          >
            {changeValue > 0 ? '+' : ''}
            {changeValue}%
          </span>{' '}
          {changeLabel && <span className="text-gray-500">{changeLabel}</span>}
        </p>
      )}
    </div>
  )
}
