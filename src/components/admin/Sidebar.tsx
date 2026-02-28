'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Ticket,
  Zap,
  Truck,
  Box,
  Megaphone,
  BarChart3,
  ImagePlus,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders / Замовлення', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products / Товари', href: '/admin/products', icon: Box },
  { name: 'Inventory / Запаси', href: '/admin/inventory', icon: Package },
  { name: 'Customers / Клієнти', href: '/admin/customers', icon: Users },
  { name: 'Coupons / Купони', href: '/admin/coupons', icon: Ticket },
  { name: 'Offers / Акції', href: '/admin/offers', icon: Zap },
  { name: 'Shipping / Доставка', href: '/admin/shipping', icon: Truck },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'AI Studio', href: '/admin/ai-studio', icon: ImagePlus },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Admin', color: 'text-amber-400' },
  STORE_OWNER: { label: 'Propietaria', color: 'text-emerald-400' },
  CUSTOMER: { label: 'Customer', color: 'text-gray-400' },
}

interface SidebarProps {
  open: boolean
  onClose: () => void
  user: {
    name?: string | null
    email: string
    role: string
  }
}

export function Sidebar({ open, onClose, user }: SidebarProps) {
  const pathname = usePathname()
  const roleInfo = roleLabels[user.role] ?? { label: user.role, color: 'text-gray-400' }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-charcoal transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <Link href="/admin" className="text-lg font-semibold text-white">
            Blossom
          </Link>
          <button onClick={onClose} className="text-gray-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}

          {/* Open CMS link */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <Link
              href="/studio"
              target="_blank"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Content Editor (CMS)
            </Link>
            <Link
              href="/"
              target="_blank"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              View Store
            </Link>
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user.name || user.email}
            </p>
            <p className={`text-xs font-medium ${roleInfo.color}`}>
              {roleInfo.label}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
