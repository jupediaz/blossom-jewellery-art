import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const broadcasts = await db.newsletterBroadcast.findMany({
    orderBy: { sentAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(broadcasts)
}
