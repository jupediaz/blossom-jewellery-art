import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { User, Package, MapPin, Heart, ArrowLeft } from 'lucide-react'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/account/login')
  }

  const navItems = [
    { href: '/account', icon: User, label: 'My Account' },
    { href: '/account/orders', icon: Package, label: 'Orders' },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses' },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-gray-900">
          My Account
        </h1>
        <p className="mt-1 text-sm text-gray-500">{session.user.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 lg:flex-col">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  )
}
