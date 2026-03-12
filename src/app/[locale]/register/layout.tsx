import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('register') }
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
