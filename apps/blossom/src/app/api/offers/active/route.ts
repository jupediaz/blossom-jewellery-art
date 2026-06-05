import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 60

export async function GET() {
  try {
    const now = new Date()
    const offers = await db.offer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { discountValue: 'desc' },
    })
    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Failed to fetch active offers:', error)
    return NextResponse.json({ offers: [] })
  }
}
