'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

export function AccountNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/account') {
      return /^(\/[a-z]{2})?\/account$/.test(pathname)
    }
    return pathname.includes(href)
  }

  return (
    <nav className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-charcoal text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                active ? 'bg-white/20 text-white' : 'bg-charcoal text-white'
              }`}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}
