import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/cms/queries";
import { mockProducts } from "@/lib/mock-data";
import { rateLimit } from "@/lib/rate-limit";

interface SearchResult {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  inStock: boolean;
  collection: { name: string } | null;
  imageUrl: string | null;
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { limit: 60, windowSeconds: 60 })
  if (limited) return limited

  const raw = req.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") ?? 0));

  if (!raw || raw.length < 2 || raw.length > 100) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const sanityResults = await searchProducts(raw);
    const page = sanityResults.slice(offset, offset + limit).map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug.current,
      price: p.price,
      imageUrl: p.imageUrl || null,
      collection: p.collection?.name || null,
    }));
    return NextResponse.json({ results: page, total: sanityResults.length });
  } catch {
    // Sanity not configured — fall back to in-memory mock search
  }

  const q = raw.toLowerCase();
  const matched = mockProducts.filter((p) => {
    const searchable = [p.name, p.collection?.name, p.category?.name, ...(p.materials || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchable.includes(q);
  });

  const results = matched.slice(offset, offset + limit).map((p) => ({
    _id: p._id,
    name: p.name,
    slug: p.slug.current,
    price: p.price,
    imageUrl: p.imageUrl || null,
    collection: p.collection?.name || null,
  }));

  return NextResponse.json({ results, total: matched.length });
}
