import Link from "next/link";
import { sanityFetch } from "@/lib/sanity/client";
import { allProductsQuery, allCategoriesQuery } from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product, Category } from "@/lib/types";
import type { Metadata } from "next";
import { mockProducts, mockCollections } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Shop All — Blossom Jewellery Art",
  description:
    "Browse our collection of handcrafted polymer clay flower jewellery. Earrings, necklaces, bracelets, rings and complete sets.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; collection?: string; sort?: string }>;
}) {
  const params = await searchParams;
  let products: Product[] = mockProducts;
  let categories: Category[] = [];

  try {
    const [sanityProducts, sanityCategories] = await Promise.all([
      sanityFetch<Product[]>(allProductsQuery),
      sanityFetch<Category[]>(allCategoriesQuery),
    ]);

    if (sanityProducts.length > 0) {
      products = sanityProducts;
    }
    if (sanityCategories.length > 0) {
      categories = sanityCategories;
    }
  } catch {
    // Sanity not configured - using mock data
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
  }

  // Derive collection filters from mock data when no Sanity categories
  const collections = mockCollections;
  const activeCollection = params.collection;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light mb-2">Shop</h1>
        <p className="text-warm-gray text-sm">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
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
          All
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
          <span>Sort by:</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}sort=price-asc`}
            className={`hover:text-charcoal transition-colors ${params.sort === "price-asc" ? "text-charcoal font-medium" : ""}`}
          >
            Price low
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}sort=price-desc`}
            className={`hover:text-charcoal transition-colors ${params.sort === "price-desc" ? "text-charcoal font-medium" : ""}`}
          >
            high
          </Link>
          <span>/</span>
          <Link
            href={`/products?${activeCollection ? `collection=${activeCollection}&` : ""}sort=name`}
            className={`hover:text-charcoal transition-colors ${params.sort === "name" ? "text-charcoal font-medium" : ""}`}
          >
            Name
          </Link>
        </div>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">
            No products found in this collection.
          </p>
          <Link href="/products" className="text-sage text-sm underline mt-2 inline-block">
            View all pieces
          </Link>
        </div>
      )}
    </div>
  );
}
