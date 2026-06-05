import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminShell } from '../AdminShell'
import { contactMessageDb, db } from '@/lib/db'

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

  const [unreadMessages, pendingReviews, pendingReturns] = await Promise.all([
    contactMessageDb.count({ where: { isRead: false } }).catch(() => 0),
    db.review.count({ where: { isApproved: false } }).catch(() => 0),
    db.return.count({ where: { status: 'REQUESTED' } }).catch(() => 0),
  ])

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      unreadMessages={unreadMessages}
      pendingReviews={pendingReviews}
      pendingReturns={pendingReturns}
    >
      {children}
    </AdminShell>
  )
}
