import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, rate, estimatedDaysMin, estimatedDaysMax, isActive } = body as {
    name?: string
    rate?: number
    estimatedDaysMin?: number
    estimatedDaysMax?: number
    isActive?: boolean
  }

  const method = await db.shippingMethod.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(rate !== undefined && { rate }),
      ...(estimatedDaysMin !== undefined && { estimatedDaysMin }),
      ...(estimatedDaysMax !== undefined && { estimatedDaysMax }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json({ ...method, rate: Number(method.rate) })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const orderCount = await db.order.count({ where: { shippingMethodId: id } })
  if (orderCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete method with existing orders. Deactivate it instead.' },
      { status: 409 }
    )
  }

  await db.shippingMethod.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
