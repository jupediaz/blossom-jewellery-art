import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminShell } from '../AdminShell'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/admin/login')
  }

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'STORE_OWNER') {
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
