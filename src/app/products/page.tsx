import { sanityFetch } from "@/lib/sanity/client";
import { allProductsQuery, allCategoriesQuery } from "@/lib/sanity/queries";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product, Category } from "@/lib/types";
import type { Metadata } from "next";
import { mockProducts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Browse our collection of handcrafted artisan jewelry. Earrings, necklaces, bracelets and more.",
};

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  let products: Product[] = mockProducts;
  let categories: Category[] = [];

  try {
    const [sanityProducts, sanityCategories] = await Promise.all([
      sanityFetch<Product[]>(allProductsQuery),
      sanityFetch<Category[]>(allCategoriesQuery),
    ]);

    // Use Sanity data if available
    if (sanityProducts.length > 0) {
      products = sanityProducts;
    }
    if (sanityCategories.length > 0) {
      categories = sanityCategories;
    }
  } catch {
    // Sanity not configured - using mock data
  }

  // Client-side filtering by category
  if (params.category) {
    products = products.filter(
      (p) => p.category?.slug.current === params.category
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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light mb-2">Shop</h1>
        <p className="text-warm-gray text-sm">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {/* Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/products"
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !params.category
                ? "bg-charcoal text-cream border-charcoal"
                : "border-cream-dark text-warm-gray hover:border-charcoal"
            }`}
          >
            All
          </a>
          {categories.map((cat) => (
            <a
              key={cat._id}
              href={`/products?category=${cat.slug.current}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                params.category === cat.slug.current
                  ? "bg-charcoal text-cream border-charcoal"
                  : "border-cream-dark text-warm-gray hover:border-charcoal"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">
            No products found. Add products via the{" "}
            <a href="/studio" className="text-sage underline">
              Sanity Studio
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
