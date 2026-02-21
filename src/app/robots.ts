import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blossomjewellery.art'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/studio/', '/account/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
