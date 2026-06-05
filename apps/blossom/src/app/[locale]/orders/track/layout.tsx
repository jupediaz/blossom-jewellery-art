import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return {
    title: t('trackOrder'),
    description: t('trackOrderDesc'),
  }
}

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
