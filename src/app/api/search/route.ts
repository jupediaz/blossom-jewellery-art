import { NextRequest, NextResponse } from "next/server";
import { sanityFetch } from "@/lib/sanity/client";
import { allProductsQuery } from "@/lib/sanity/queries";
import { mockProducts } from "@/lib/mock-data";
import { rateLimit } from "@/lib/rate-limit";
import type { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 60, windowSeconds: 60 })
  if (limited) return limited

  const query = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") ?? 0));

  if (!query || query.length < 2 || query.length > 100) {
    return NextResponse.json({ results: [], total: 0 });
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

  const matched = products.filter((p) => {
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
  });

  const results = matched
    .slice(offset, offset + limit)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug.current,
      price: p.price,
      imageUrl: p.imageUrl || null,
      collection: p.collection?.name || null,
    }));

  return NextResponse.json({ results, total: matched.length });
}
