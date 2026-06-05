import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

// GET /api/reviews?productId=xxx&page=1&limit=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10', 10) || 10)

  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { sanityProductId: productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        body: true,
        isVerified: true,
        createdAt: true,
      },
    }),
    db.review.count({ where: { sanityProductId: productId, isApproved: true } }),
  ])

  const ratingCounts = await db.review.groupBy({
    by: ['rating'],
    where: { sanityProductId: productId, isApproved: true },
    _count: { rating: true },
  })

  const avgResult = await db.review.aggregate({
    where: { sanityProductId: productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  return NextResponse.json({
    reviews,
    total,
    page,
    pages: Math.ceil(total / limit),
    averageRating: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : null,
    totalCount: avgResult._count.rating,
    ratingCounts: Object.fromEntries(ratingCounts.map((r) => [r.rating, r._count.rating])),
  })
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowSeconds: 300 })
  if (limited) return limited

  const session = await auth()
  const body = await req.json()
  const { productId, rating, title, body: reviewBody, authorName } = body

  if (!productId || !rating || !reviewBody) {
    return NextResponse.json({ error: 'productId, rating, and body are required' }, { status: 400 })
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be 1–5' }, { status: 400 })
  }
  if (typeof reviewBody !== 'string' || reviewBody.trim().length < 10) {
    return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 })
  }

  const name = session?.user?.name ?? authorName ?? 'Anonymous'

  // Check if user has purchased this product (for verified badge)
  let isVerified = false
  if (session?.user?.id) {
    const order = await db.order.findFirst({
      where: {
        customerId: session.user.id,
        status: { in: ['DELIVERED', 'SHIPPED'] },
        items: { some: { sanityProductId: productId } },
      },
    })
    isVerified = !!order
  }

  // Prevent duplicate reviews from same user for same product
  if (session?.user?.id) {
    const existing = await db.review.findFirst({
      where: { sanityProductId: productId, userId: session.user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }
  }

  const review = await db.review.create({
    data: {
      sanityProductId: productId,
      userId: session?.user?.id ?? null,
      authorName: name,
      rating,
      title: title?.trim() || null,
      body: reviewBody.trim(),
      isVerified,
      isApproved: false, // requires admin approval
    },
    select: { id: true, authorName: true, rating: true, isVerified: true },
  })

  return NextResponse.json({ review, message: 'Review submitted and awaiting approval' }, { status: 201 })
}
