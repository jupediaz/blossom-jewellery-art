'use client'

import dynamic from 'next/dynamic'

const AIDescriptionGenerator = dynamic(
  () => import('@/components/admin/AIDescriptionGenerator').then((mod) => mod.AIDescriptionGenerator),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
)

export { AIDescriptionGenerator as AIDescriptionGeneratorLoader }
