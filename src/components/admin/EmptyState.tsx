import { type LucideIcon, Package } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
      <Icon className="h-12 w-12 text-gray-300" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <a
          href={action.href}
          className="mt-4 rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          {action.label}
        </a>
      )}
    </div>
  )
}
