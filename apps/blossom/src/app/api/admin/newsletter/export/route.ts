import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { newsletterDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const activeParam = searchParams.get('active')

  const where = {
    ...(activeParam !== null && activeParam !== '' ? { isActive: activeParam === 'true' } : {}),
  }

  const subscribers = await newsletterDb.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100_000,
  })

  const lines = [
    'Email,Locale,Status,Subscribed At',
    ...subscribers.map(
      (s) =>
        `${s.email},${s.locale},${s.isActive ? 'Active' : 'Unsubscribed'},${s.createdAt.toISOString()}`
    ),
  ]

  const filename = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
