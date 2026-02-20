import Anthropic from '@anthropic-ai/sdk'

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined
}

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic

export async function generateProductDescription({
  input,
  inputLanguage,
  productType,
  materials,
  collection,
}: {
  input: string
  inputLanguage: 'en' | 'es' | 'uk'
  productType?: string
  materials?: string[]
  collection?: string
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    uk: 'Ukrainian',
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are a luxury artisan jewelry copywriter for "Blossom Jewellery Art", a brand creating handmade polymer clay botanical jewelry in Marbella, Spain. The artist is Ukrainian.

Brand voice: Organic elegance, botanical inspiration, artisanal warmth. Each piece tells a story of nature's beauty captured in polymer clay.

The product manager has written this description in ${languageNames[inputLanguage]}:
"${input}"

${productType ? `Product type: ${productType}` : ''}
${materials?.length ? `Materials: ${materials.join(', ')}` : ''}
${collection ? `Collection: ${collection}` : ''}

Generate product content in ALL THREE languages (English, Spanish, Ukrainian). Return ONLY valid JSON with this exact structure:
{
  "en": {
    "name": "Product name in English",
    "shortDescription": "1-2 sentence hook for product cards",
    "longDescription": "3-4 paragraph evocative description for product page, storytelling style",
    "materials": "Materials and care instructions",
    "seoTitle": "SEO meta title (max 60 chars)",
    "seoDescription": "SEO meta description (max 155 chars)",
    "instagramCaption": "Instagram caption with relevant hashtags"
  },
  "es": { ...same structure in Spanish... },
  "uk": { ...same structure in Ukrainian... }
}`,
      },
    ],
  })

  const text =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response as JSON')

  return JSON.parse(jsonMatch[0]) as Record<
    string,
    {
      name: string
      shortDescription: string
      longDescription: string
      materials: string
      seoTitle: string
      seoDescription: string
      instagramCaption: string
    }
  >
}
