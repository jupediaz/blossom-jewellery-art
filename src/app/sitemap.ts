import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/lib/sanity/client'
import { routing } from '@/i18n/routing'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blossomjewellery.art'

function localePrefix(locale: string) {
  return locale === routing.defaultLocale ? '' : `/${locale}`
}

function alternates(path: string) {
  const languages: Record<string, string> = {}
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}${localePrefix(locale)}${path}`
  }
  return { languages }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    '', // homepage
    '/products',
    '/collections',
    '/about',
    '/contact',
    '/shipping',
    '/size-guide',
    '/blog',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
    alternates: alternates(path),
  }))

  // Dynamic product pages
  type SlugResult = { slug: { current: string } }

  const [products, collections, blogPosts] = await Promise.all([
    sanityFetch<SlugResult[]>(
      `*[_type == "product" && !(_id in path("drafts.**"))]{ slug }`
    ),
    sanityFetch<SlugResult[]>(
      `*[_type == "collection" && !(_id in path("drafts.**"))]{ slug }`
    ),
    sanityFetch<SlugResult[]>(
      `*[_type == "blogPost" && !(_id in path("drafts.**"))]{ slug }`
    ),
  ])

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug.current}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
    alternates: alternates(`/products/${p.slug.current}`),
  }))

  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${siteUrl}/collections/${c.slug.current}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: alternates(`/collections/${c.slug.current}`),
  }))

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${siteUrl}/blog/${b.slug.current}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: alternates(`/blog/${b.slug.current}`),
  }))

  return [...staticEntries, ...productEntries, ...collectionEntries, ...blogEntries]
}
