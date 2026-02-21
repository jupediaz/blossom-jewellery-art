'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

const locales: { code: Locale; label: string; flag: React.ReactNode }[] = [
  {
    code: 'en',
    label: 'English',
    flag: (
      <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-sm" aria-hidden="true">
        <rect width="24" height="16" fill="#012169" />
        <path d="M0,0 L24,16 M24,0 L0,16" stroke="#fff" strokeWidth="2.5" />
        <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.5" />
        <path d="M12,0 V16 M0,8 H24" stroke="#fff" strokeWidth="4" />
        <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    code: 'es',
    label: 'Espanol',
    flag: (
      <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-sm" aria-hidden="true">
        <rect width="24" height="4" fill="#AA151B" />
        <rect width="24" height="8" y="4" fill="#F1BF00" />
        <rect width="24" height="4" y="12" fill="#AA151B" />
      </svg>
    ),
  },
  {
    code: 'uk',
    label: 'Українська',
    flag: (
      <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-sm" aria-hidden="true">
        <rect width="24" height="8" fill="#005BBB" />
        <rect width="24" height="8" y="8" fill="#FFD500" />
      </svg>
    ),
  },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = locales.find((l) => l.code === locale) || locales[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchLocale(newLocale: Locale) {
    setOpen(false)
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded px-2 py-1 text-warm-gray hover:text-charcoal transition-colors"
        aria-label="Switch language"
      >
        {current.flag}
        <span className="text-xs uppercase tracking-wide">{current.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                l.code === locale
                  ? 'bg-gray-50 font-medium text-charcoal'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
              }`}
            >
              {l.flag}
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
