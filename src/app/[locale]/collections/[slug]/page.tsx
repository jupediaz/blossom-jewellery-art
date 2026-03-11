import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { sanityFetch } from "@/lib/sanity/client";
import { collectionBySlugQuery, allCollectionsQuery } from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Collection } from "@/lib/types";
import { mockCollections, mockProducts } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";

const collectionImages: Record<string, string> = {
  "ukrainian-heritage": "/images/collections/ukrainian-heritage-cover.jpg",
  "red-roses": "/images/collections/red-roses-cover.jpg",
  "pink-roses": "/images/collections/pink-roses-cover.jpg",
  "yellow-roses": "/images/collections/yellow-roses-cover.jpg",
  "orchid-dreams": "/images/collections/orchid-dreams-cover.jpg",
  "dark-bloom": "/images/collections/dark-bloom-cover.jpg",
  "peony-delicates": "/images/collections/peony-delicates-cover.jpg",
  "mediterranean-garden": "/images/collection-necklaces.jpg",
  "stud-earrings": "/images/collections/stud-earrings-cover.jpg",
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const collections = await sanityFetch<Collection[]>(
      allCollectionsQuery
    );
    if (collections.length > 0) {
      return collections.map((c) => ({ slug: c.slug.current }));
    }
  } catch {
    // Use mock data
  }
  return mockCollections.map((c) => ({ slug: c.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await sanityFetch<Collection>(
      collectionBySlugQuery,
      { slug }
    );
    if (!collection) return {};
    return {
      title: collection.name,
      description:
        collection.description ||
        `Browse the ${collection.name} collection of handcrafted jewelry.`,
    };
  } catch {
    return {};
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations("Collections");
  const tc = await getTranslations("Common");
  const { slug } = await params;
  let collection: Collection | null = null;

  try {
    const sanityCollection = await sanityFetch<Collection>(collectionBySlugQuery, { slug });
    // Only use Sanity collection if it's valid (not empty array or null)
    if (sanityCollection && typeof sanityCollection === 'object' && !Array.isArray(sanityCollection)) {
      collection = sanityCollection;
    }
  } catch {
    // Sanity error - will use mock data below
  }

  // If no valid collection from Sanity, use mock data
  if (!collection || !collection.slug) {
    collection = mockCollections.find(c => c.slug.current === slug) || null;
  }

  if (!collection) notFound();

  // Assign products to collection if not present — filter by collection reference
  if (!collection.products || collection.products.length === 0) {
    collection.products = mockProducts.filter(
      (p) => p.collection?._id === collection._id
    );
  }

  const coverImage = collectionImages[collection.slug.current];

  // Fetch active offers to show sale badges on collection products
  const now = new Date()
  let offersByProductId: Record<string, import('@/components/product/ProductCard').ActiveOffer> = {}
  try {
    const activeOffers = await db.offer.findMany({
      where: { isActive: true, validFrom: { lte: now }, validUntil: { gte: now } },
      orderBy: { discountValue: 'desc' },
    })
    for (const offer of activeOffers) {
      const offerData = { id: offer.id, discountType: offer.discountType, discountValue: Number(offer.discountValue), badgeText: offer.badgeText, validUntil: offer.validUntil.toISOString() }
      if (offer.applyToAll) {
        for (const product of collection.products || []) {
          if (!offersByProductId[product._id]) offersByProductId[product._id] = offerData
        }
      } else {
        for (const productId of offer.applicableProducts) {
          if (!offersByProductId[productId]) offersByProductId[productId] = offerData
        }
      }
    }
  } catch {
    // Offers unavailable — continue without
  }

  return (
    <div>
      {/* Collection Hero */}
      {coverImage && (
        <section className="relative h-[40vh] min-h-[300px] flex items-end bg-cream-dark overflow-hidden">
          <Image
            src={coverImage}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
          <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-8">
            <h1 className="font-heading text-4xl sm:text-5xl font-light text-cream mb-2">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-cream-dark/90 max-w-2xl text-sm sm:text-base">
                {collection.description}
              </p>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { name: tc("home"), href: "/" },
            { name: tc("collections"), href: "/collections" },
            { name: collection.name },
          ]}
        />

        {/* Title (only if no hero image) */}
        {!coverImage && (
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-light mb-2">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-warm-gray max-w-2xl">{collection.description}</p>
            )}
          </div>
        )}

        <p className="text-warm-gray text-sm mb-8">
          {t("pieces", { count: collection.products?.length || 0 })}
        </p>

        {collection.products && collection.products.length > 0 ? (
          <ProductGrid products={collection.products} offersByProductId={offersByProductId} />
        ) : (
          <div className="text-center py-16">
            <p className="text-warm-gray">
              {t("emptyCollection")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
