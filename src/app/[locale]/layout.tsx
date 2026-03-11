import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { HtmlLangUpdater } from '@/components/HtmlLangUpdater'
import { CartSyncInit } from '@/components/CartSyncInit'
import { ToastProvider } from '@/components/Toast'
import { Providers } from '@/components/Providers'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      <Providers>
      <ToastProvider>
        <HtmlLangUpdater locale={locale} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-charcoal focus:text-cream focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <CartDrawer />
        <CartSyncInit />
      </ToastProvider>
      </Providers>
    </NextIntlClientProvider>
  )
}
