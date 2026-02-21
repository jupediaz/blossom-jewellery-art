import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Account')
  return { title: t('savedAddresses') }
}

export default function AddressesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
