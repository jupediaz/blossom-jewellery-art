'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useRef, useTransition, Suspense } from 'react'
import { Search } from 'lucide-react'

interface AdminSearchInputProps {
  placeholder?: string
  paramName?: string
}

function SearchInputInner({ placeholder, paramName }: Required<AdminSearchInputProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim()
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set(paramName, value)
        } else {
          params.delete(paramName)
        }
        params.delete('page')
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`)
        })
      }, 350)
    },
    [router, pathname, searchParams, paramName]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        defaultValue={searchParams.get(paramName) ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        className="rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
      />
    </div>
  )
}

export function AdminSearchInput({
  placeholder = 'Search...',
  paramName = 'q',
}: AdminSearchInputProps) {
  return (
    <Suspense fallback={
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder={placeholder}
          disabled
          className="rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400"
        />
      </div>
    }>
      <SearchInputInner placeholder={placeholder} paramName={paramName} />
    </Suspense>
  )
}
