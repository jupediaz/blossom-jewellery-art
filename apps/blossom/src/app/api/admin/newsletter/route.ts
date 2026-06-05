import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { newsletterDb } from '@/lib/db'

const PAGE_SIZE = 50

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const search = searchParams.get('search') ?? ''
  const locale = searchParams.get('locale') ?? ''
  const activeParam = searchParams.get('active')

  const where = {
    ...(activeParam !== null && activeParam !== ''
      ? { isActive: activeParam === 'true' }
      : {}),
    ...(locale ? { locale } : {}),
    ...(search ? { email: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [subscribers, total] = await Promise.all([
    newsletterDb.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    newsletterDb.count({ where }),
  ])

  return NextResponse.json({ subscribers, total, page, pageSize: PAGE_SIZE })
}
