import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { sanityFetch } from "@/lib/sanity/client";
import {
  featuredProductsQuery,
  allCollectionsQuery,
} from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LocalBusinessJsonLd } from "@/components/JsonLd";
import type { Product, Collection } from "@/lib/types";
import { mockProducts, mockCollections } from "@/lib/mock-data";

export const revalidate = 60;

async function getData() {
  const [featuredProducts, collections] = await Promise.all([
    sanityFetch<Product[]>(featuredProductsQuery),
    sanityFetch<Collection[]>(allCollectionsQuery),
  ]);
  return { featuredProducts, collections };
}

export default async function HomePage() {
  let featuredProducts: Product[] = mockProducts.filter(p => p.featured);
  let collections: Collection[] = mockCollections;

  try {
    const data = await getData();
    // If Sanity returns data, use it instead of mock data
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
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-cream-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 to-charcoal/40 z-10" />
        <Image
          src="/images/hero-jewellery.jpg"
          alt="Handcrafted botanical jewellery"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 text-center text-charcoal px-4">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-light tracking-wider mb-4">
            Blossom
          </h1>
          <p className="text-lg sm:text-xl tracking-wide font-light mb-2">
            Jewellery Art
          </p>
          <p className="text-sm sm:text-base text-warm-gray max-w-md mx-auto mb-8">
            Handcrafted pieces inspired by nature, made with love in Europe
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
          >
            Shop Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-3xl font-light">Featured Pieces</h2>
            <Link
              href="/products"
              className="text-sm text-warm-gray hover:text-charcoal transition-colors flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}

      {/* Placeholder when no products yet */}
      {featuredProducts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2 className="font-heading text-3xl font-light mb-4">Coming Soon</h2>
          <p className="text-warm-gray max-w-md mx-auto">
            Our collection is being curated. Connect your Sanity CMS to start
            adding products.
          </p>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-light text-center mb-12">
              Collections
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
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                    <h3 className="font-heading text-2xl mb-1">
                      {collection.name}
                    </h3>
                    {collection.productCount !== undefined && (
                      <p className="text-sm text-cream-dark">
                        {collection.productCount} pieces
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
      <section className="bg-cream-dark/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/about/olha-portrait.jpg"
                  alt="Olha Finiv-Hoshovska — Blossom Jewellery Art creator, surrounded by flowers"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-5 py-3 shadow-lg hidden sm:block">
                <p className="text-xs text-warm-gray uppercase tracking-wider">Handmade in</p>
                <p className="font-heading text-lg text-charcoal">Europe</p>
              </div>
            </div>
            <div>
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                Meet the Artist
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-2">
                Olha Finiv-Hoshovska
              </h2>
              <p className="text-sage-dark text-sm italic mb-6">
                Founder &amp; Artisan behind Blossom Jewellery Art
              </p>
              <p className="text-warm-gray leading-relaxed mb-4">
                Every petal, every leaf, every tiny bud is sculpted by hand with the same love
                that nature puts into growing a flower. Olha transforms polymer clay into
                miniature botanical masterpieces — wearable art that carries the soul of
                handcraft.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                Inspired by Ukrainian floral traditions and the gardens of Europe,
                each piece is a one-of-a-kind creation. No moulds, no shortcuts —
                just patience, passion, and an eye for the beauty that blooms
                around us.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm text-charcoal border-b border-charcoal pb-0.5 hover:text-sage-dark hover:border-sage-dark transition-colors"
              >
                Read Olha&apos;s Full Story
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
            Join the Blossom Family
          </h2>
          <p className="text-warm-gray text-sm mb-6">
            Be the first to know about new collections, exclusive offers, and
            behind-the-scenes stories.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 border border-sage/30 rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
              required
            />
            <button
              type="submit"
              className="bg-sage text-white px-6 py-2.5 rounded text-sm hover:bg-sage-dark transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
