import type { Payload } from 'payload'
import { getPayloadClient } from './payload'
import type { Product, Category, Collection, CmsMedia } from '@/lib/types'

// Commerce data access backed by Payload, returning the SAME shape the storefront
// expected from the former Sanity GROQ queries (slug as { current }, imageUrl
// derived from the first image, category/collection as { _id, name, slug }), so
// consumer components need minimal changes.

export type Locale = 'en' | 'es' | 'uk'

type AnyDoc = Record<string, unknown> & { id: number | string }

// Graceful fallback: if the CMS/DB is unreachable (e.g. during `next build` with
// no DB, or a transient outage) return the fallback instead of throwing, so pages
// render (empty/ISR) and the build never fails on a DB connection.
async function safe<T>(run: (payload: Payload) => Promise<T>, fallback: T): Promise<T> {
  try {
    const payload = await getPayloadClient()
    return await run(payload)
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[cms] query failed, using fallback:', (err as Error).message)
    }
    return fallback
  }
}

function firstImageUrl(images: unknown): string | undefined {
  if (!Array.isArray(images)) return undefined
  const first = images[0] as { url?: string } | undefined
  return first?.url ?? undefined
}

function mapRef(rel: unknown): Product['category'] {
  if (!rel || typeof rel !== 'object') return undefined
  const r = rel as { id: number | string; name?: string; slug?: string }
  return { _id: String(r.id), name: r.name ?? '', slug: { current: r.slug ?? '' } }
}

function mapProductCard(p: AnyDoc): Product {
  return {
    _id: String(p.id),
    _createdAt: p.createdAt as string,
    name: p.name as string,
    slug: { current: p.slug as string },
    price: p.price as number,
    compareAtPrice: (p.compareAtPrice as number | null) ?? undefined,
    images: ((p.images as CmsMedia[]) ?? []).filter((m) => m && typeof m === 'object'),
    imageUrl: firstImageUrl(p.images),
    category: mapRef(p.category),
    collection: mapRef(p.collection),
    inStock: p.inStock as boolean,
    featured: p.featured as boolean,
  }
}

function mapProductDetail(p: AnyDoc): Product {
  const materials = Array.isArray(p.materials)
    ? (p.materials as { value?: string }[]).map((m) => m.value).filter((v): v is string => !!v)
    : undefined
  return {
    ...mapProductCard(p),
    description: p.description, // Lexical richtext (rendered by RichText component)
    materials,
    dimensions: p.dimensions as string | undefined,
    careInstructions: p.careInstructions as string | undefined,
    variants: p.variants as { name: string; priceModifier?: number; inStock: boolean }[] | undefined,
    seo: p.seo as Product['seo'],
  }
}

export function getAllProducts(locale: Locale = 'en'): Promise<Product[]> {
  return safe(async (payload) => {
    const res = await payload.find({ collection: 'products', locale, depth: 1, limit: 1000, sort: 'name' })
    return res.docs.map((d) => mapProductCard(d as AnyDoc))
  }, [])
}

export function getNewProducts(locale: Locale = 'en', limit = 12): Promise<Product[]> {
  return safe(async (payload) => {
    const res = await payload.find({ collection: 'products', locale, depth: 1, limit, sort: '-createdAt' })
    return res.docs.map((d) => mapProductCard(d as AnyDoc))
  }, [])
}

export function getFeaturedProducts(locale: Locale = 'en'): Promise<Product[]> {
  return safe(async (payload) => {
    const res = await payload.find({
      collection: 'products', locale, depth: 1, limit: 8,
      where: { featured: { equals: true } },
    })
    return res.docs.map((d) => mapProductCard(d as AnyDoc))
  }, [])
}

export function getProductBySlug(slug: string, locale: Locale = 'en'): Promise<(Product & { relatedProducts: Product[] }) | null> {
  return safe(async (payload) => {
    const res = await payload.find({
      collection: 'products', locale, depth: 2, limit: 1,
      where: { slug: { equals: slug } },
    })
    const doc = res.docs[0] as AnyDoc | undefined
    if (!doc) return null
    const product = mapProductDetail(doc)
    let relatedProducts: Product[] = []
    const categoryId = (doc.category as { id?: number | string } | undefined)?.id
    if (categoryId != null) {
      const rel = await payload.find({
        collection: 'products', locale, depth: 1, limit: 4,
        where: { and: [{ category: { equals: categoryId } }, { id: { not_equals: doc.id } }] },
      })
      relatedProducts = rel.docs.map((d) => mapProductCard(d as AnyDoc))
    }
    return { ...product, relatedProducts }
  }, null)
}

export function getProductsByCategory(categorySlug: string, locale: Locale = 'en'): Promise<Product[]> {
  return safe(async (payload) => {
    const cat = await payload.find({ collection: 'categories', locale, limit: 1, where: { slug: { equals: categorySlug } } })
    const categoryId = (cat.docs[0] as AnyDoc | undefined)?.id
    if (categoryId == null) return []
    const res = await payload.find({
      collection: 'products', locale, depth: 1, limit: 1000,
      where: { category: { equals: categoryId } },
    })
    return res.docs.map((d) => mapProductCard(d as AnyDoc))
  }, [])
}

export function getAllCategories(locale: Locale = 'en'): Promise<Category[]> {
  return safe(async (payload) => {
    const res = await payload.find({ collection: 'categories', locale, depth: 1, limit: 1000, sort: 'name' })
    return res.docs.map((c): Category => {
      const d = c as AnyDoc
      return {
        _id: String(d.id),
        name: d.name as string,
        slug: { current: d.slug as string },
        description: d.description as string | undefined,
        image: (d.image as CmsMedia) ?? undefined,
      }
    })
  }, [])
}

export function getAllCollections(locale: Locale = 'en'): Promise<Collection[]> {
  return safe(async (payload) => {
    const res = await payload.find({ collection: 'collections', locale, depth: 1, limit: 1000, sort: 'name' })
    const collections = res.docs as AnyDoc[]
    return Promise.all(
      collections.map(async (d): Promise<Collection> => {
        const count = await payload.count({ collection: 'products', where: { collection: { equals: d.id } } })
        return {
          _id: String(d.id),
          name: d.name as string,
          slug: { current: d.slug as string },
          description: d.description as string | undefined,
          image: (d.image as CmsMedia) ?? undefined,
          productCount: count.totalDocs,
        }
      }),
    )
  }, [])
}

export function getCollectionBySlug(slug: string, locale: Locale = 'en'): Promise<Collection | null> {
  return safe(async (payload) => {
    const res = await payload.find({ collection: 'collections', locale, depth: 1, limit: 1, where: { slug: { equals: slug } } })
    const d = res.docs[0] as AnyDoc | undefined
    if (!d) return null
    const products = await payload.find({
      collection: 'products', locale, depth: 1, limit: 1000,
      where: { collection: { equals: d.id } },
    })
    const result: Collection = {
      _id: String(d.id),
      name: d.name as string,
      slug: { current: d.slug as string },
      description: d.description as string | undefined,
      image: (d.image as CmsMedia) ?? undefined,
      products: products.docs.map((p) => mapProductCard(p as AnyDoc)),
    }
    return result
  }, null)
}

export type SearchResultItem = {
  _id: string
  name: string
  slug: { current: string }
  price: number
  inStock: boolean
  collection?: { name: string }
  imageUrl?: string
}

export function searchProducts(query: string, locale: Locale = 'en'): Promise<SearchResultItem[]> {
  return safe(async (payload) => {
    const res = await payload.find({
      collection: 'products', locale, depth: 1, limit: 50,
      where: { name: { like: query } },
    })
    return res.docs.map((d) => {
      const card = mapProductCard(d as AnyDoc)
      return {
        _id: card._id, name: card.name, slug: card.slug, price: card.price, inStock: card.inStock,
        collection: card.collection ? { name: card.collection.name } : undefined, imageUrl: card.imageUrl,
      }
    })
  }, [])
}

export function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return Promise.resolve([])
  return safe(async (payload) => {
    const numericIds = ids.map((i) => (Number.isNaN(Number(i)) ? i : Number(i)))
    const res = await payload.find({
      collection: 'products', depth: 1, limit: ids.length,
      where: { id: { in: numericIds } },
    })
    return res.docs.map((d) => mapProductCard(d as AnyDoc))
  }, [])
}

export type CheckoutProduct = {
  _id: string
  name: string
  price: number
  inStock: boolean
  collection: Product['collection']
}

// Server-side price/stock lookup for checkout validation (replaces the Sanity
// GROQ price fetch). Returns one entry per matched product id (string).
export function getProductsForCheckout(ids: string[]): Promise<CheckoutProduct[]> {
  return safe(async (payload) => {
    const numericIds = ids.map((i) => (Number.isNaN(Number(i)) ? i : Number(i)))
    const res = await payload.find({
      collection: 'products', depth: 1, limit: ids.length || 1,
      where: { id: { in: numericIds } },
    })
    return res.docs.map((d) => {
      const p = d as AnyDoc
      return {
        _id: String(p.id),
        name: p.name as string,
        price: p.price as number,
        inStock: p.inStock as boolean,
        collection: mapRef(p.collection),
      }
    })
  }, [])
}
