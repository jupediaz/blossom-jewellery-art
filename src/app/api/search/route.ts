import { NextRequest, NextResponse } from "next/server";
import { sanityFetch } from "@/lib/sanity/client";
import { allProductsQuery } from "@/lib/sanity/queries";
import { mockProducts } from "@/lib/mock-data";
import type { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let products: Product[] = mockProducts;

  try {
    const sanityProducts = await sanityFetch<Product[]>(allProductsQuery);
    if (sanityProducts.length > 0) {
      products = sanityProducts;
    }
  } catch {
    // Sanity not configured — using mock data
  }

  const results = products
    .filter((p) => {
      const searchable = [
        p.name,
        p.collection?.name,
        p.category?.name,
        ...(p.materials || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    })
    .slice(0, 8)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug.current,
      price: p.price,
      imageUrl: p.imageUrl || null,
      collection: p.collection?.name || null,
    }));

  return NextResponse.json({ results });
}
