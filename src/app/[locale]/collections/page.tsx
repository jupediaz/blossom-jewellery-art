import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
import { allCollectionsQuery } from "@/lib/sanity/queries";
import type { Collection } from "@/lib/types";
import { mockCollections } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Collections");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function CollectionsPage() {
  const t = await getTranslations("Collections");
  let collections: Collection[] = mockCollections;

  try {
    const sanityCollections = await sanityFetch<Collection[]>(allCollectionsQuery);
    if (sanityCollections.length > 0) {
      collections = sanityCollections;
    }
  } catch {
    // Sanity not configured - using mock data
  }

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

  const fallbackImages = [
    "/images/collection-earrings.jpg",
    "/images/collection-necklaces.jpg",
    "/images/collection-rings.jpg",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-2">{t("title")}</h1>
      <p className="text-warm-gray mb-8">
        {t("subtitle")}
      </p>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, idx) => (
            <Link
              key={collection._id}
              href={`/collections/${collection.slug.current}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-dark"
            >
              <Image
                src={collection.image ? urlFor(collection.image).width(800).url() : collectionImages[collection.slug.current] || fallbackImages[idx % fallbackImages.length]}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                <h2 className="font-heading text-2xl mb-1">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="text-sm text-cream-dark/80 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                {collection.productCount !== undefined && (
                  <p className="text-xs text-cream-dark mt-2">
                    {t("pieces", { count: collection.productCount })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">{t("emptyCollection")}</p>
        </div>
      )}
    </div>
  );
}
