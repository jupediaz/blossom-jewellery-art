import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { zoneId, name, rate, estimatedDaysMin, estimatedDaysMax, isActive } = body as {
    zoneId: string
    name: string
    rate: number
    estimatedDaysMin: number
    estimatedDaysMax: number
    isActive?: boolean
  }

  if (!zoneId || !name || rate === undefined || !estimatedDaysMin || !estimatedDaysMax) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const method = await db.shippingMethod.create({
    data: {
      zoneId,
      name,
      rate,
      estimatedDaysMin,
      estimatedDaysMax,
      isActive: isActive ?? true,
    },
  })

  return NextResponse.json({ ...method, rate: Number(method.rate) }, { status: 201 })
}
