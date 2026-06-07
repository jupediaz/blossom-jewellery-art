/**
 * Product feed for Instagram Shopping / Facebook Commerce
 * Returns products in a format compatible with Meta Commerce Manager
 */

import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/cms/queries";
import { siteConfig } from "@/lib/env";
import type { Product } from "@/lib/types";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const products = await getAllProducts();

    const feed = products
      .filter((p) => p.inStock && p.imageUrl)
      .map((product) => ({
        id: product._id,
        title: product.name,
        description:
          product.seo?.metaDescription ||
          `${product.name} — Handcrafted artisan jewelry by ${siteConfig.creator}`,
        availability: product.inStock ? "in stock" : "out of stock",
        condition: "new",
        price: `${product.price.toFixed(2)} EUR`,
        link: `${siteConfig.url}/products/${product.slug.current}`,
        image_link: product.imageUrl,
        brand: siteConfig.name,
        ...(product.category && { product_type: product.category.name }),
        ...(product.materials &&
          product.materials.length > 0 && {
            material: product.materials.join(", "),
          }),
      }));

    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
