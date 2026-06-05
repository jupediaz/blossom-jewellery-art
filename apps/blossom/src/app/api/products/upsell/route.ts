import { NextRequest, NextResponse } from 'next/server'
import { groq } from 'next-sanity'
import { sanityFetch } from '@/lib/sanity/client'

export async function GET(req: NextRequest) {
  const exclude = req.nextUrl.searchParams.get('exclude')?.split(',').filter(Boolean) ?? []

  const query = groq`
    *[_type == "product" && !(_id in path("drafts.**")) && inStock == true ${exclude.length ? `&& !(_id in $exclude)` : ''}]
    | order(featured desc, orderRank) [0...4] {
      _id,
      name,
      slug,
      price,
      compareAtPrice,
      inStock,
      "imageUrl": images[0].asset->url
    }
  `

  try {
    const products = await sanityFetch<unknown[]>(query, exclude.length ? { exclude } : undefined)
    return NextResponse.json(products ?? [])
  } catch {
    return NextResponse.json([])
  }
}
