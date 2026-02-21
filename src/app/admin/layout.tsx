import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminShell } from './AdminShell'

export const metadata = {
  title: 'Admin | Blossom Jewellery',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/admin/login')
  }

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'PRODUCT_MANAGER') {
    redirect('/')
  }

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </AdminShell>
  )
}
