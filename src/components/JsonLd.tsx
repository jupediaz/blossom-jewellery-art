/**
 * JSON-LD structured data components for SEO
 *
 * Uses dangerouslySetInnerHTML which is the standard Next.js pattern for
 * injecting JSON-LD. All data comes from our own config/CMS objects (safe).
 */

import { siteConfig } from "@/lib/env";
import type { Product, BlogPost } from "@/lib/types";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Store",
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        image: `${siteConfig.url}${siteConfig.ogImage}`,
        priceRange: "$$",
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        founder: {
          "@type": "Person",
          name: siteConfig.creator,
        },
        makesOffer: {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            category: "Handmade Jewelry",
          },
        },
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.imageUrl || "",
        description:
          product.seo?.metaDescription ||
          `${product.name} — Handcrafted artisan jewelry by ${siteConfig.creator}`,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        ...(product.materials &&
          product.materials.length > 0 && {
            material: product.materials.join(", "),
          }),
        offers: {
          "@type": "Offer",
          url: `${siteConfig.url}/products/${product.slug.current}`,
          priceCurrency: "EUR",
          price: product.price,
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: siteConfig.name,
          },
        },
      }}
    />
  );
}

export function BlogPostJsonLd({ post }: { post: BlogPost }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || "",
        author: {
          "@type": "Person",
          name: post.author || siteConfig.creator,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        ...(post.publishedAt && { datePublished: post.publishedAt }),
        url: `${siteConfig.url}/blog/${post.slug.current}`,
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
