'use client'

import dynamic from 'next/dynamic'

const AnalyticsCharts = dynamic(
  () => import('./AnalyticsCharts').then((mod) => mod.AnalyticsCharts),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl" /> }
)

export { AnalyticsCharts as AnalyticsChartsLoader }
