import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { collectionBySlugQuery, allCollectionsQuery } from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Collection } from "@/lib/types";
import { mockCollections, mockProducts } from "@/lib/mock-data";

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

  // Assign products to collection if not present
  if (!collection.products || collection.products.length === 0) {
    // Distribute products across collections
    const productsPerCollection = Math.ceil(mockProducts.length / mockCollections.length);
    const collectionIndex = mockCollections.findIndex(c => c._id === collection._id);
    const start = collectionIndex * productsPerCollection;
    collection.products = mockProducts.slice(start, start + productsPerCollection);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light mb-2">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-warm-gray max-w-2xl">{collection.description}</p>
        )}
      </div>

      {collection.products && collection.products.length > 0 ? (
        <ProductGrid products={collection.products} />
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">
            No products in this collection yet.
          </p>
        </div>
      )}
    </div>
  );
}
