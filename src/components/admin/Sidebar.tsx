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
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Box },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Offers', href: '/admin/offers', icon: Zap },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'AI Studio', href: '/admin/ai-studio', icon: ImagePlus },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

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
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="text-lg font-semibold text-white">
            Blossom Admin
          </Link>
          <button onClick={onClose} className="text-gray-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-white">{user.name || user.email}</p>
            <p className="text-xs text-gray-400">{user.role.replace('_', ' ')}</p>
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
