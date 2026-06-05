import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { contactMessageDb } from '@/lib/db'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await contactMessageDb.update({ where: { id }, data: { isRead: true } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}
