'use client'

import dynamic from 'next/dynamic'

const StudioTabs = dynamic(
  () => import('@/components/admin/ai-studio/StudioTabs').then((mod) => mod.StudioTabs),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-xl bg-gray-100" /> }
)

export { StudioTabs as StudioTabsLoader }
