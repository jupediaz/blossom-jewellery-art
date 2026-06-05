import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const addressSchema = z.object({
  label:      z.string().max(50).optional(),
  firstName:  z.string().min(1).max(50),
  lastName:   z.string().min(1).max(50),
  line1:      z.string().min(1).max(100),
  line2:      z.string().max(100).optional(),
  city:       z.string().min(1).max(50),
  state:      z.string().max(50).optional(),
  postalCode: z.string().min(1).max(20),
  country:    z.string().length(2, 'Must be a 2-letter ISO country code'),
  phone:      z.string().max(20).optional(),
  isDefault:  z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(addresses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof addressSchema>
  try {
    body = addressSchema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Limit to 10 addresses per user
  const count = await db.address.count({ where: { userId: session.user.id } })
  if (count >= 10) {
    return NextResponse.json({ error: 'Maximum of 10 addresses allowed' }, { status: 422 })
  }

  // If setting as default, unset any existing default
  if (body.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await db.address.create({
    data: { userId: session.user.id, ...body, isDefault: body.isDefault || false },
  })

  return NextResponse.json(address, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: { id?: string } & Record<string, unknown>
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { id, ...fields } = rawBody

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  }

  // Validate patch fields through partial schema to ensure correct types
  let data: Partial<z.infer<typeof addressSchema>>
  try {
    data = addressSchema.partial().parse(fields)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Verify ownership
  const existing = await db.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // If setting as default, unset any existing default
  if (data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await db.address.update({
    where: { id },
    data,
  })

  return NextResponse.json(address)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
  }

  // Verify ownership
  const address = await db.address.findUnique({ where: { id } })
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.address.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
