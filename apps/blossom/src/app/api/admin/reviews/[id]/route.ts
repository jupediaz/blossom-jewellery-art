import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// PATCH /api/admin/reviews/[id] — approve or reject
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { action } = await req.json() // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  if (action === 'reject') {
    await db.review.delete({ where: { id } })
    return NextResponse.json({ message: 'Review deleted' })
  }

  const review = await db.review.update({
    where: { id },
    data: { isApproved: true },
  })

  return NextResponse.json({ review })
}
