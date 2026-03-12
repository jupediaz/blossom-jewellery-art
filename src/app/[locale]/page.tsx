import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
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

/* Bijoux-style dash button */
function DashButton({
  href,
  children,
  variant = "outline",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "outline" | "ghost";
}) {
  return (
    <Link
      href={href as "/"}
      className={`
        inline-flex items-center gap-3
        text-[11px] font-semibold tracking-[0.2em] uppercase font-body
        transition-colors duration-200
        ${variant === "outline"
          ? "border border-muted text-muted hover:border-navy hover:text-navy px-5 py-2.5"
          : "text-muted hover:text-navy"
        }
      `}
    >
      <span className="block w-5 h-px bg-current flex-shrink-0" />
      {children}
    </Link>
  );
}

export default async function HomePage() {
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');
  const tcol = await getTranslations('Collections');

  let featuredProducts: Product[] = mockProducts.filter(p => p.featured);
  let collections: Collection[] = mockCollections;

  try {
    const data = await getData();
    if (data.featuredProducts.length > 0) featuredProducts = data.featuredProducts;
    if (data.collections.length > 0) collections = data.collections;
  } catch {
    // Sanity not configured — using mock data
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
    <>
      <LocalBusinessJsonLd />

      {/* ─── 1. HERO ────────────────────────────────────────────── */}
      {/* Section bg = cream. Left panel: text. Right panel: circle (behind) + model image (on top).
          Image has transparent bg. As viewport narrows, the right edge of the image clips. */}
      <section className="bg-cream min-h-screen flex flex-col lg:flex-row">

        {/* Left panel — text content */}
        <div className="relative z-10 flex w-full lg:w-[42%] flex-col justify-center px-10 sm:px-16 lg:px-20 py-24 lg:py-0">
          <h1
            className="font-heading text-navy mb-6"
            style={{ fontSize: "clamp(3.5rem,9vw,130px)", lineHeight: "0.923", letterSpacing: "-0.033em" }}
          >
            {t('heroH1Line1')}<br />
            {t('heroH1Line2')}
          </h1>
          <p
            className="font-heading italic text-muted mb-10"
            style={{ fontSize: "clamp(1.4rem,2.5vw,36px)", lineHeight: "1.17", letterSpacing: "0.083em" }}
          >
            {t('heroDisplaySubtitle')}
          </p>
          <div>
            <DashButton href="/products" variant="ghost">
              {t('shopNowShort')}
            </DashButton>
          </div>

          {/* Scroll indicator */}
          <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 opacity-40">
            <span className="block w-px h-8 bg-navy" />
            <span className="block w-1.5 h-1.5 border-r border-b border-navy rotate-45" />
          </div>
        </div>

        {/* Right panel — clips image on the right as viewport narrows */}
        <div className="relative flex-1 min-h-[60vh] lg:min-h-0 overflow-hidden">
          {/* Shared container: exact image aspect ratio × full panel height.
              Circle and image are siblings inside — they always move and scale together. */}
          <div
            className="absolute top-0 left-0 h-full"
            style={{ aspectRatio: "1781 / 1792" }}
          >
            {/* Circle: decorative backdrop, BEHIND the image */}
            <div className="absolute top-[3%] left-[40%] w-[60%] aspect-square rounded-full bg-[#E8E2DC] z-[0]" />
            {/* Model image: transparent bg, on top of circle */}
            <Image
              src="/images/hero-model.webp"
              alt=""
              aria-hidden="true"
              fill
              className="object-contain z-[1]"
              priority
            />
          </div>
        </div>
      </section>

      {/* ─── 2. WATERMARK SECTION ─────────────────────────────────── */}
      <section className="relative bg-cream overflow-hidden py-20 lg:py-28">
        {/* Watermark lines */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 font-heading leading-none select-none pointer-events-none whitespace-nowrap"
          style={{ fontSize: "clamp(120px,17vw,240px)", color: "#EEE8E3", lineHeight: 1 }}
        >
          {t('watermarkLine1')}
        </div>
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-heading leading-none select-none pointer-events-none whitespace-nowrap"
          style={{ fontSize: "clamp(120px,17vw,240px)", color: "#EEE8E3", lineHeight: 1 }}
        >
          {t('watermarkLine2')}
        </div>

        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-10">
          <p className="font-heading italic text-[clamp(1rem,2vw,1.4rem)] text-muted max-w-lg leading-relaxed mb-8">
            {t("heroMission")}
          </p>
          <Link
            href="/products"
            className="inline-flex flex-col items-center gap-1 w-[72px] h-[72px] justify-center border border-muted/50 rounded-full text-[9px] font-semibold tracking-[0.18em] uppercase text-muted hover:border-navy hover:text-navy transition-colors font-body"
          >
            {t("ourStore")}
          </Link>
        </div>
      </section>

      {/* ─── 3. SELECTED WORKS — Products ─────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="bg-cream py-0">
          <div className="mx-auto max-w-[1260px] px-6 lg:px-10 pb-20">
            <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] text-navy mb-10 pt-2">
              {t("selectedWorks")}
            </h2>
            {/* 4-col grid with dividers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-cream-dark">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product._id} className="px-4 first:pl-0 last:pr-0">
                  <Link href={`/products/${product.slug.current}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-beige/30 mb-5">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={420}
                          height={560}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-navy font-body leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-semibold text-navy font-body whitespace-nowrap flex-shrink-0">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    {(product.collection || product.category) && (
                      <p className="text-[11px] text-muted font-body">
                        {product.collection?.name || product.category?.name}
                        {" · "}
                        <span>{product.category?.name || "handmade"}</span>
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. PROMO BANNER 1 — Featured Collection ──────────────── */}
      {collections.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-[1260px] px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row items-stretch min-h-[420px]">
              {/* Color block */}
              <div className="w-full lg:w-[38%] bg-beige flex-shrink-0" />
              {/* Image */}
              <div className="relative w-full lg:w-[24%] min-h-[300px]">
                <Image
                  src={collectionImages[collections[0]?.slug?.current] || fallbackImages[0]}
                  alt={collections[0]?.name || "Collection"}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
              {/* Text */}
              <div className="flex-1 flex flex-col justify-center px-10 py-14">
                <h2
                  className="font-heading text-[clamp(2rem,4vw,3.5rem)] text-navy leading-tight mb-3"
                  style={{ letterSpacing: "-1px" }}
                >
                  {collections[0]?.name || "Handcrafted Collection"}
                </h2>
                <p className="font-heading italic text-muted text-[1.1rem] mb-8">
                  beautiful pieces. excellent quality.
                </p>
                <DashButton href={`/collections/${collections[0]?.slug?.current || ""}`} variant="outline">
                  Discover
                </DashButton>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. PROMO BANNER 2 — Perfect Match ───────────────────── */}
      <section className="bg-cream py-0">
        <div className="mx-auto max-w-[1260px] px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
            {/* Text */}
            <div className="flex-1 flex flex-col justify-center py-14 lg:pr-10">
              <h2
                className="font-heading text-[clamp(2.2rem,4vw,3.8rem)] text-navy leading-tight mb-3"
                style={{ letterSpacing: "-1px" }}
              >
                Perfect Match<br />for Every Occasion
              </h2>
              <p className="font-heading italic text-muted text-[1.1rem] mb-8 max-w-xs">
                coordinate with other pieces from<br />the collection for a classic look.
              </p>
              <DashButton href="/collections" variant="outline">
                Discover the set
              </DashButton>
            </div>
            {/* Color block */}
            <div className="w-full lg:w-[38%] bg-blue-soft flex-shrink-0 min-h-[260px]" />
          </div>
        </div>
      </section>

      {/* ─── 6. COLLECTIONS WATERMARK SECTION ─────────────────────── */}
      <section className="relative bg-cream overflow-hidden pt-10 pb-16">
        {/* Giant watermark */}
        <div
          aria-hidden="true"
          className="font-heading leading-none select-none pointer-events-none text-center w-full mb-6"
          style={{ fontSize: "clamp(80px,18vw,260px)", color: "#D6B59F", lineHeight: 0.9 }}
        >
          {t('collectionsLabel')}
        </div>

        {/* 3-col collection grid — bijoux initial-letter style */}
        <div className="mx-auto max-w-[1260px] px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.slice(0, 3).map((collection, idx) => (
              <Link
                key={collection._id}
                href={`/collections/${collection.slug.current}`}
                className="group block"
              >
                <div className="aspect-square relative overflow-hidden bg-beige/30 mb-4">
                  <Image
                    src={collectionImages[collection.slug.current] || fallbackImages[idx] || fallbackImages[0]}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-heading text-[1.8rem] text-terracotta-light leading-none">
                    {collection.name.charAt(0)}
                  </span>
                  <h3 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-navy font-body">
                    {collection.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. ARTIST FEATURE SECTION — bijoux editorial style ──── */}
      <section className="bg-beige/30">
        <div className="mx-auto max-w-[1260px] px-6 lg:px-10 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image — circular crop */}
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/about/olha-portrait.jpg"
                alt={t('artistName')}
                fill
                sizes="260px"
                className="object-cover object-top"
              />
            </div>
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <h2
                className="font-heading text-[clamp(2rem,3.5vw,3rem)] text-navy leading-tight mb-3"
                style={{ letterSpacing: "-1px" }}
              >
                {t('artistName')} Collection
              </h2>
              <p className="font-heading italic text-muted text-[1.1rem] mb-6">
                {t('artistRole')}
              </p>
              <ul className="text-[12px] font-body text-muted tracking-wide space-y-1.5 mb-8 lg:list-none">
                <li>— {t('handmadeIn')} Europe</li>
                <li>— Polymer clay art jewellery</li>
                <li>— Limited edition pieces</li>
              </ul>
              <DashButton href="/about" variant="ghost">
                {t('readFullStory')}
              </DashButton>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. NEWSLETTER — minimal bijoux style ─────────────────── */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-[560px] px-6 text-center">
          <div className="w-px h-10 bg-cream-dark mx-auto mb-8" />
          <h2 className="font-heading text-[clamp(1.8rem,3vw,2.5rem)] text-navy mb-3">
            {t('newsletterTitle')}
          </h2>
          <p className="font-heading italic text-muted text-[1rem] mb-10">
            {t('newsletterText')}
          </p>
          <NewsletterForm variant="light" />
        </div>
      </section>

      {/* ─── 9. FOOTER WATERMARK (rendered inside footer, but stub here for spacing) */}
    </>
  );
}
