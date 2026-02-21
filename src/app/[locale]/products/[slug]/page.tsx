import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { productBySlugQuery, allProductsQuery } from "@/lib/sanity/queries";
import { siteConfig } from "@/lib/env";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import type { Product } from "@/lib/types";
import { mockProducts } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await sanityFetch<Product[]>(allProductsQuery);
    if (products.length > 0) {
      return products.map((p) => ({ slug: p.slug.current }));
    }
  } catch {
    // Use mock data
  }
  return mockProducts.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await sanityFetch<Product>(productBySlugQuery, {
      slug,
    });
    if (!product) return {};

    const title = product.seo?.metaTitle || product.name;
    const description =
      product.seo?.metaDescription ||
      `${product.name} — Handcrafted artisan jewelry by ${siteConfig.creator}. ${product.materials?.join(", ") || ""}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: product.imageUrl ? [{ url: product.imageUrl }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    const sanityProduct = await sanityFetch<Product>(productBySlugQuery, { slug });
    // Only use Sanity product if it's valid (not empty array or null)
    if (sanityProduct && typeof sanityProduct === 'object' && !Array.isArray(sanityProduct)) {
      product = sanityProduct;
    }
  } catch {
    // Sanity error - will use mock data below
  }

  // If no valid product from Sanity, use mock data
  if (!product || !product.slug) {
    product = mockProducts.find(p => p.slug.current === slug) || null;
  }

  if (!product) notFound();

  // TypeScript now knows product is not null and has slug
  const currentProduct: Product = product;

  // Add related products: prefer same collection, then fill with other products
  if (!currentProduct.relatedProducts || currentProduct.relatedProducts.length === 0) {
    const sameCollection = mockProducts.filter(
      (p) => p._id !== currentProduct._id && p.collection?._id === currentProduct.collection?._id
    );
    const otherProducts = mockProducts.filter(
      (p) => p._id !== currentProduct._id && p.collection?._id !== currentProduct.collection?._id
    );
    currentProduct.relatedProducts = [...sameCollection, ...otherProducts].slice(0, 4);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ProductJsonLd product={currentProduct} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Products", url: `${siteConfig.url}/products` },
          { name: currentProduct.name, url: `${siteConfig.url}/products/${currentProduct.slug?.current || slug}` },
        ]}
      />
      <ProductDetail product={currentProduct} />

      {/* Related Products */}
      {currentProduct.relatedProducts && currentProduct.relatedProducts.length > 0 && (
        <RelatedProducts products={currentProduct.relatedProducts} />
      )}
    </div>
  );
}

async function RelatedProducts({ products }: { products: Product[] }) {
  const t = await getTranslations("Products");
  return (
    <section className="mt-16 pt-12 border-t border-cream-dark">
      <h2 className="font-heading text-2xl font-light mb-8">
        {t("relatedProducts")}
      </h2>
      <ProductGrid products={products} columns={4} />
    </section>
  );
}
