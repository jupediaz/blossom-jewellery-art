import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { siteConfig } from "@/lib/env";
import { sanityFetch } from "@/lib/sanity/client";
import {
  featuredProductsQuery,
  allCollectionsQuery,
} from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import { NewsletterForm } from "@/components/NewsletterForm";
import { LocalBusinessJsonLd } from "@/components/JsonLd";
import type { Product, Collection } from "@/lib/types";
import { mockProducts, mockCollections } from "@/lib/mock-data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");
  const description = t("heroSubtitleShort");
  return {
    title: t("heroTitle"),
    description,
    openGraph: {
      title: `${t("heroTitle")} | ${siteConfig.name}`,
      description,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  };
}

async function getData() {
  const [featuredProducts, collections] = await Promise.all([
    sanityFetch<Product[]>(featuredProductsQuery),
    sanityFetch<Collection[]>(allCollectionsQuery),
  ]);
  return { featuredProducts, collections };
}

export default async function HomePage() {
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const tcol = await getTranslations('Collections');

  let featuredProducts: Product[] = mockProducts.filter(p => p.featured);
  let collections: Collection[] = mockCollections;

  try {
    const data = await getData();
    if (data.featuredProducts.length > 0) {
      featuredProducts = data.featuredProducts;
    }
    if (data.collections.length > 0) {
      collections = data.collections;
    }
  } catch {
    // Sanity not configured — using mock data
  }

  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <section className="relative h-screen min-h-[700px] flex items-end bg-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/20 to-charcoal/80 z-10" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-sage/30 to-transparent z-10 pointer-events-none" />
        <Image
          src="/images/hero-jewellery.jpg"
          alt="Blossom Jewellery Art"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-16 sm:pb-24">
          <p className="text-white/90 text-xs tracking-[0.45em] uppercase mb-5 font-light [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
            Handcrafted Polymer Clay Jewellery
          </p>
          <h1 className="font-heading text-7xl sm:text-8xl lg:text-[9rem] font-light text-white leading-none tracking-tight mb-3">
            Blossom
          </h1>
          <p className="text-base sm:text-lg tracking-[0.35em] font-light text-white/60 uppercase mb-10">
            Jewellery Art
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-charcoal px-8 py-3.5 text-sm tracking-wide hover:bg-sage transition-colors"
            >
              {t('shopNowShort')}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 border border-white/50 text-white px-8 py-3.5 text-sm tracking-wide hover:border-white transition-colors"
            >
              {tcol('title')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-light">{t('featuredTitle')}</h2>
            <Link
              href="/products"
              className="text-sm text-warm-gray hover:text-charcoal transition-colors flex items-center gap-1"
            >
              {tc('viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}

      {featuredProducts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="font-heading text-3xl font-light mb-4">{t('comingSoon')}</h2>
          <p className="text-warm-gray max-w-md mx-auto">
            {t('comingSoonText')}
          </p>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-light text-center mb-12">
              {tcol('title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.slice(0, 3).map((collection, idx) => {
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
                  <Link
                    key={collection._id}
                    href={`/collections/${collection.slug.current}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-cream-dark"
                  >
                    <Image
                      src={collectionImages[collection.slug.current] || fallbackImages[idx] || fallbackImages[0]}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                    <h3 className="font-heading text-2xl mb-1">
                      {collection.name}
                    </h3>
                    {collection.productCount !== undefined && (
                      <p className="text-sm text-cream-dark">
                        {tcol('pieces', { count: collection.productCount })}
                      </p>
                    )}
                  </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Meet the Artist */}
      <section className="bg-sage-light py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/about/olha-portrait.jpg"
                  alt={t('artistName')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-5 py-3 shadow-lg hidden sm:block">
                <p className="text-xs text-warm-gray uppercase tracking-wider">{t('handmadeIn')}</p>
                <p className="font-heading text-lg text-charcoal">{t('europe')}</p>
              </div>
            </div>
            <div>
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                {t('meetArtist')}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-2">
                {t('artistName')}
              </h2>
              <p className="text-sage-dark text-sm italic mb-6">
                {t('artistRole')}
              </p>
              <p className="text-warm-gray leading-relaxed mb-4">
                {t('artistBio1')}
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                {t('artistBio2')}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm text-charcoal border-b border-charcoal pb-0.5 hover:text-sage-dark hover:border-sage-dark transition-colors"
              >
                {t('readFullStory')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-sage/10 py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="font-heading text-3xl font-light mb-3">
            {t('newsletterTitle')}
          </h2>
          <p className="text-warm-gray text-sm mb-6">
            {t('newsletterText')}
          </p>
          <div className="max-w-sm mx-auto">
            <NewsletterForm variant="light" />
          </div>
        </div>
      </section>
    </>
  );
}
