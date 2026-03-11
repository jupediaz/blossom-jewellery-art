import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sanityFetch } from '@/lib/sanity/client'
import { groq } from 'next-sanity'

const syncProductsQuery = groq`
  *[_type == "product" && !(_id in path("drafts.**"))] {
    _id,
    name,
    slug,
    inStock,
    variants[] {
      name,
      inStock
    }
  }
`

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

  const products = await sanityFetch<SanityProduct[]>(syncProductsQuery)

  if (!products || products.length === 0) {
    return NextResponse.json({ created: 0, existing: 0, message: 'No products found in Sanity' })
  }

  let created = 0
  let existing = 0

  for (const product of products) {
    if (!product.variants || product.variants.length === 0) {
      // Single-variant product
      const exists = await db.inventory.findUnique({
        where: { sanityProductId_sanityVariantKey: { sanityProductId: product._id, sanityVariantKey: null as unknown as string } },
      })

      if (!exists) {
        // findUnique with null in compound unique needs different approach
        const existsNull = await db.inventory.findFirst({
          where: { sanityProductId: product._id, sanityVariantKey: null },
        })

        if (!existsNull) {
          await db.inventory.create({
            data: {
              sanityProductId: product._id,
              quantityTotal: product.inStock ? 1 : 0,
            },
          })
          created++
        } else {
          existing++
        }
      } else {
        existing++
      }
    } else {
      // Multi-variant product
      for (const variant of product.variants) {
        const existsVariant = await db.inventory.findFirst({
          where: { sanityProductId: product._id, sanityVariantKey: variant.name },
        })

        if (!existsVariant) {
          await db.inventory.create({
            data: {
              sanityProductId: product._id,
              sanityVariantKey: variant.name,
              quantityTotal: variant.inStock ? 1 : 0,
            },
          })
          created++
        } else {
          existing++
        }
      }
    }
  }

  return NextResponse.json({
    created,
    existing,
    total: products.length,
    message: `Synced ${products.length} products: ${created} new records, ${existing} already tracked`,
  })
}
