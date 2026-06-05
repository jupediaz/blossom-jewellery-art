import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { newsletterDb } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { isActive } = body as { isActive: boolean }
  if (typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'isActive boolean required' }, { status: 400 })
  }

  try {
    const updated = await newsletterDb.update({ where: { id }, data: { isActive } })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 })
  }
}
