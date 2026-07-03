import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { User, Package, MapPin, Heart, Settings, Star, RotateCcw, ArrowLeft } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { db } from '@/lib/db'
import { AccountNav } from './AccountNav'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    const locale = await getLocale()
    redirect(`/${locale}/login`)
  }

  const [t, wishlistCount, activeReturns] = await Promise.all([
    getTranslations('Account'),
    db.wishlist.count({ where: { userId: session.user.id } }).catch(() => 0),
    db.return.count({
      where: { customerId: session.user.id, status: { in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED'] } },
    }).catch(() => 0),
  ])

  const navItems = [
    { href: '/account', icon: User, label: t('title'), badge: 0 },
    { href: '/account/orders', icon: Package, label: t('orders'), badge: 0 },
    { href: '/account/addresses', icon: MapPin, label: t('addresses'), badge: 0 },
    { href: '/account/wishlist', icon: Heart, label: t('wishlist'), badge: wishlistCount },
    { href: '/account/reviews', icon: Star, label: t('myReviews'), badge: 0 },
    { href: '/account/returns', icon: RotateCcw, label: t('myReturns'), badge: activeReturns },
    { href: '/account/settings', icon: Settings, label: t('settings'), badge: 0 },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToShop')}
        </Link>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{session.user.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <AccountNav items={navItems} />
        <div>{children}</div>
      </div>
    </div>
  )
}
