import Link from "next/link";
import Image from "next/image";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
import { allCollectionsQuery } from "@/lib/sanity/queries";
import type { Collection } from "@/lib/types";
import type { Metadata } from "next";
import { mockCollections } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse our curated jewelry collections.",
};

export const revalidate = 60;

export default async function CollectionsPage() {
  let collections: Collection[] = mockCollections;

  try {
    const sanityCollections = await sanityFetch<Collection[]>(allCollectionsQuery);
    if (sanityCollections.length > 0) {
      collections = sanityCollections;
    }
  } catch {
    // Sanity not configured - using mock data
  }

  const collectionImages = [
    "/images/collection-earrings.jpg",
    "/images/collection-necklaces.jpg",
    "/images/collection-rings.jpg",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">Collections</h1>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection, idx) => (
            <Link
              key={collection._id}
              href={`/collections/${collection.slug.current}`}
              className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-cream-dark"
            >
              <Image
                src={collection.image ? urlFor(collection.image).width(800).url() : collectionImages[idx % collectionImages.length]}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                <h2 className="font-heading text-3xl mb-1">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="text-sm text-cream-dark line-clamp-2">
                    {collection.description}
                  </p>
                )}
                {collection.productCount !== undefined && (
                  <p className="text-xs text-cream-dark mt-2">
                    {collection.productCount} pieces
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">Collections coming soon.</p>
        </div>
      )}
    </div>
  );
}
