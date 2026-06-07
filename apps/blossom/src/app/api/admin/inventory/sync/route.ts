import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getAllProducts } from '@/lib/cms/queries'

interface SanityProduct {
  _id: string
  name: string
  slug: { current: string }
  inStock: boolean
  variants?: Array<{ name: string; inStock: boolean }>
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cmsProducts = await getAllProducts()
  const products: SanityProduct[] = cmsProducts.map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug,
    inStock: p.inStock,
    variants: p.variants,
  }))

  if (!products || products.length === 0) {
    return NextResponse.json({ created: 0, existing: 0, message: 'No products found in CMS' })
  }

  // Collect all product IDs for a single batch fetch — replaces N+1 findFirst per product/variant
  const productIds = products.map((p) => p._id)
  const existingRecords = await db.inventory.findMany({
    where: { sanityProductId: { in: productIds } },
    select: { sanityProductId: true, sanityVariantKey: true },
  })

  // Build a Set for O(1) lookup: "productId__variantKey" (null variant → "productId__")
  const existingKeys = new Set(
    existingRecords.map((r) => `${r.sanityProductId}__${r.sanityVariantKey ?? ''}`)
  )

  // Build all records that need to be created
  const toCreate: Array<{
    sanityProductId: string
    sanityVariantKey?: string
    quantityTotal: number
  }> = []

  for (const product of products) {
    if (!product.variants || product.variants.length === 0) {
      const key = `${product._id}__`
      if (!existingKeys.has(key)) {
        toCreate.push({
          sanityProductId: product._id,
          quantityTotal: product.inStock ? 1 : 0,
        })
      }
    } else {
      for (const variant of product.variants) {
        const key = `${product._id}__${variant.name}`
        if (!existingKeys.has(key)) {
          toCreate.push({
            sanityProductId: product._id,
            sanityVariantKey: variant.name,
            quantityTotal: variant.inStock ? 1 : 0,
          })
        }
      }
    }
  }

  // Single createMany — one round-trip for all new records
  if (toCreate.length > 0) {
    await db.inventory.createMany({ data: toCreate, skipDuplicates: true })
  }

  const created = toCreate.length
  const existing = existingRecords.length

  return NextResponse.json({
    created,
    existing,
    total: products.length,
    message: `Synced ${products.length} products: ${created} new records, ${existing} already tracked`,
  })
}
