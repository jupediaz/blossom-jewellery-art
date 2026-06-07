import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/cms/queries'

export async function GET(req: NextRequest) {
  const exclude = req.nextUrl.searchParams.get('exclude')?.split(',').filter(Boolean) ?? []

  try {
    const all = await getAllProducts()
    const products = all
      .filter((p) => p.inStock && !exclude.includes(p._id))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
      .slice(0, 4)
    return NextResponse.json(products)
  } catch {
    return NextResponse.json([])
  }
}
