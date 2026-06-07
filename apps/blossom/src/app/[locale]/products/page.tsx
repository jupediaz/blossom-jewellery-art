import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import { getAllProducts, getNewProducts, getAllCategories } from "@/lib/cms/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getTranslations } from "next-intl/server";
import type { Product, Category } from "@/lib/types";
import { mockProducts, mockCollections } from "@/lib/mock-data";
import { db } from "@/lib/db";
import type { ActiveOffer } from "@/components/product/ProductCard";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Products");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

const PAGE_SIZE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; collection?: string; sort?: string; page?: string }>;
}) {
  const t = await getTranslations("Products");
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page ?? 1));
  let products: Product[] = mockProducts;
  let categories: Category[] = [];

  const now = new Date();
  // Fetch Sanity data + active offers in parallel
  const [sanityResult, dbOffers] = await Promise.all([
    (async () => {
      try {
        const [sanityProducts, sanityCategories] = await Promise.all([
          params.sort === "new" ? getNewProducts() : getAllProducts(),
          getAllCategories(),
        ]);
        return { products: sanityProducts, categories: sanityCategories };
      } catch {
        return { products: [] as Product[], categories: [] as Category[] };
      }
    })(),
    db.offer.findMany({
      where: { isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
      orderBy: { discountValue: "desc" },
    }).catch(() => []),
  ]);

  if (sanityResult.products.length > 0) products = sanityResult.products;
  if (sanityResult.categories.length > 0) categories = sanityResult.categories;

  // Build productId -> best offer map — O(offers + products) via pre-indexed sets
  let offersByProductId: Record<string, ActiveOffer> = {};
  try {
    // Pre-index each offer's applicable IDs/slugs into Sets for O(1) lookups
    const indexedOffers = dbOffers.map((dbOffer) => ({
      offer: {
        id: dbOffer.id,
        discountType: dbOffer.discountType,
        discountValue: Number(dbOffer.discountValue),
        badgeText: dbOffer.badgeText,
        validUntil: dbOffer.validUntil.toISOString(),
      } as ActiveOffer,
      applyToAll: dbOffer.applyToAll,
      productIds: new Set(dbOffer.applicableProducts),
      collectionSlugs: new Set(dbOffer.applicableCollections),
    }));

    // Single pass over products; offers already sorted by discountValue desc
    for (const product of products) {
      for (const { offer, applyToAll, productIds, collectionSlugs } of indexedOffers) {
        if (offersByProductId[product._id]) break; // already has a (higher-value) offer
        const collectionSlug = product.collection?.slug.current;
        if (
          applyToAll ||
          productIds.has(product._id) ||
          (collectionSlug && collectionSlugs.has(collectionSlug))
        ) {
          offersByProductId[product._id] = offer;
        }
      }
    }
  } catch {
    // offers matching failed — continue without
  }

  // Filter by category (Sanity)
  if (params.category) {
    products = products.filter(
      (p) => p.category?.slug.current === params.category
    );
  }

  // Filter by collection (mock data or Sanity)
  if (params.collection) {
    products = products.filter(
      (p) => p.collection?.slug.current === params.collection
    );
  }

  // Sorting
  if (params.sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (params.sort === "name") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (params.sort === "new") {
    // For mock data (no _createdAt), sort by _id descending as a proxy for "newer"
    products.sort((a, b) => {
      if (a._createdAt && b._createdAt) {
        return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
      }
      return b._id.localeCompare(a._id);
    });
  }

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Mark the first 6 products as "new" when sort=new (across all pages, based on full sorted list)
  const newProductIds: Set<string> =
    params.sort === "new"
      ? new Set(products.slice(0, 6).map((p) => p._id))
      : new Set();

  // Derive collection filters from mock data when no Sanity categories
  const collections = mockCollections;
  const activeCollection = params.collection;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'
  // Build JSON-LD CollectionPage schema for SEO rich results
  // Escape < > & to prevent </script> injection (JSON.stringify doesn't escape these by default)
  const jsonLdString = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title'),
    description: t('metaDescription'),
    url: `${siteUrl}/products`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `${siteUrl}/products/${p.slug.current}`,
        image: p.imageUrl || undefined,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'EUR',
          availability: p.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light mb-2">{t("title")}</h1>
        <p className="text-warm-gray text-sm">
          {t("piecesCount", { count: products.length })}
        </p>
      </div>

      {/* Collection Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !activeCollection && !params.category
              ? "bg-charcoal text-cream border-charcoal"
              : "border-cream-dark text-warm-gray hover:border-charcoal"
          }`}
        >
          {t("all")}
        </Link>
        {categories.length > 0
          ? categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat.slug.current}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  params.category === cat.slug.current
                    ? "bg-charcoal text-cream border-charcoal"
                    : "border-cream-dark text-warm-gray hover:border-charcoal"
                }`}
              >
                {cat.name}
              </Link>
            ))
          : collections.map((col) => (
              <Link
                key={col._id}
                href={`/products?collection=${col.slug.current}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCollection === col.slug.current
                    ? "bg-charcoal text-cream border-charcoal"
                    : "border-cream-dark text-warm-gray hover:border-charcoal"
                }`}
              >
                {col.name}
              </Link>
            ))}
      </div>

      {/* Sort */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 text-xs text-warm-gray">
          <span>{t("sortBy")}:</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}${params.category ? `category=${params.category}&` : ""}`}
            className={`hover:text-charcoal transition-colors ${!params.sort ? "text-charcoal font-medium" : ""}`}
          >
            {t("sortDefault")}
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}${params.category ? `category=${params.category}&` : ""}sort=new`}
            className={`hover:text-charcoal transition-colors ${params.sort === "new" ? "text-charcoal font-medium" : ""}`}
          >
            {t("sortNew")}
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}${params.category ? `category=${params.category}&` : ""}sort=price-asc`}
            className={`hover:text-charcoal transition-colors ${params.sort === "price-asc" ? "text-charcoal font-medium" : ""}`}
          >
            {t("sortPriceLow")}
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}${params.category ? `category=${params.category}&` : ""}sort=price-desc`}
            className={`hover:text-charcoal transition-colors ${params.sort === "price-desc" ? "text-charcoal font-medium" : ""}`}
          >
            {t("sortPriceHigh")}
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}${params.category ? `category=${params.category}&` : ""}sort=name`}
            className={`hover:text-charcoal transition-colors ${params.sort === "name" ? "text-charcoal font-medium" : ""}`}
          >
            {t("sortName")}
          </Link>
        </div>
      </div>

      {paginatedProducts.length > 0 ? (
        <>
          <ProductGrid products={paginatedProducts} offersByProductId={offersByProductId} newProductIds={newProductIds} />
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4 text-sm">
              {safePage > 1 && (
                <Link
                  href={`/products?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), ...(params.collection ? { collection: params.collection } : {}), ...(params.sort ? { sort: params.sort } : {}), page: String(safePage - 1) }).toString()}`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors"
                >
                  ← {t("previous")}
                </Link>
              )}
              <span className="text-warm-gray">
                {safePage} / {totalPages}
              </span>
              {safePage < totalPages && (
                <Link
                  href={`/products?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), ...(params.collection ? { collection: params.collection } : {}), ...(params.sort ? { sort: params.sort } : {}), page: String(safePage + 1) }).toString()}`}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors"
                >
                  {t("next")} →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">
            {t("noProductsFound")}
          </p>
          <Link href="/products" className="text-sage text-sm underline mt-2 inline-block">
            {t("viewAllPieces")}
          </Link>
        </div>
      )}
    </div>
    </>
  );
}
