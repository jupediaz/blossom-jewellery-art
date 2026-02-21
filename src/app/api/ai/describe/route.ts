import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateProductDescription } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.input || !body.inputLanguage) {
    return NextResponse.json(
      { error: 'Input text and language are required' },
      { status: 400 }
    )
  }

  try {
    const result = await generateProductDescription({
      input: body.input,
      inputLanguage: body.inputLanguage,
      productType: body.productType,
      materials: body.materials,
      collection: body.collection,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI description error:', error)
    const message = error instanceof Error ? error.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
