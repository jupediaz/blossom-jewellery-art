/**
 * Sanity CMS Seed Script
 *
 * Creates all 9 collections and 17 products from mock data in Sanity CMS.
 * Images are linked via imageUrl (fallback field) and can be replaced later
 * by uploading real images through Sanity Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-sanity.ts
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN
 *     must be set in .env.local
 */

import { createClient } from "@sanity/client";

// Load env vars
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN are required"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-02-25",
  useCdn: false,
});

// ── COLLECTIONS ──────────────────────────────────────────────────────────────

const collections = [
  {
    _id: "collection-ukrainian-heritage",
    _type: "collection",
    name: "Ukrainian Heritage",
    slug: { _type: "slug", current: "ukrainian-heritage" },
    description:
      "Traditional Ukrainian patterns reimagined as wearable art. Vyshyvanka cross-stitch motifs, poppy flowers, and sunflowers celebrating Ukrainian culture and craftsmanship.",
    imageUrl:
      "/images/collections/ukrainian-heritage-cover.jpg",
  },
  {
    _id: "collection-red-roses",
    _type: "collection",
    name: "Red Roses",
    slug: { _type: "slug", current: "red-roses" },
    description:
      "Bold and passionate handcrafted red rose jewellery. Each petal sculpted by hand from polymer clay, perfect for making a statement.",
    imageUrl: "/images/collections/red-roses-cover.jpg",
  },
  {
    _id: "collection-pink-roses",
    _type: "collection",
    name: "Pink Roses",
    slug: { _type: "slug", current: "pink-roses" },
    description:
      "Romantic and delicate pink rose collection. Soft petals, crystal accents, and sterling silver create pieces that bloom with femininity.",
    imageUrl: "/images/collections/pink-roses-cover.jpg",
  },
  {
    _id: "collection-yellow-roses",
    _type: "collection",
    name: "Yellow Roses",
    slug: { _type: "slug", current: "yellow-roses" },
    description:
      "Sunshine in jewellery form. Vibrant yellow roses bring joy and warmth to any outfit. Complete sets available with matching necklace, earrings, and ring.",
    imageUrl: "/images/collections/yellow-roses-cover.jpg",
  },
  {
    _id: "collection-orchid-dreams",
    _type: "collection",
    name: "Orchid Dreams",
    slug: { _type: "slug", current: "orchid-dreams" },
    description:
      "Exotic orchids meet natural agate stones. Purple, teal, and violet tones create an enchanting collection inspired by tropical gardens.",
    imageUrl: "/images/collections/orchid-dreams-cover.jpg",
  },
  {
    _id: "collection-dark-bloom",
    _type: "collection",
    name: "Dark Bloom",
    slug: { _type: "slug", current: "dark-bloom" },
    description:
      "Modern and bold. Black, emerald green, and royal blue flowers for those who dare to be different. Statement pieces with attitude.",
    imageUrl: "/images/collections/dark-bloom-cover.jpg",
  },
  {
    _id: "collection-peony-delicates",
    _type: "collection",
    name: "Peony Delicates",
    slug: { _type: "slug", current: "peony-delicates" },
    description:
      "Ultra-delicate peonies with shimmer finish and Swarovski crystal centers. Perfect for brides, special occasions, or adding a touch of elegance.",
    imageUrl: "/images/collections/peony-delicates-cover.jpg",
  },
  {
    _id: "collection-mediterranean-garden",
    _type: "collection",
    name: "Mediterranean Garden",
    slug: { _type: "slug", current: "mediterranean-garden" },
    description:
      "Mixed bouquet collections inspired by Mediterranean gardens. Lavender, roses, and wildflowers combined with amethyst and crystal beads.",
    imageUrl: "/images/collections/mediterranean-garden-cover.jpg",
  },
  {
    _id: "collection-stud-earrings",
    _type: "collection",
    name: "Stud Earrings",
    slug: { _type: "slug", current: "stud-earrings" },
    description:
      "Everyday elegance. Miniature flower bouquets and single blooms in stud form. Lightweight, comfortable, and endlessly charming.",
    imageUrl: "/images/collections/stud-earrings-cover.jpg",
  },
];

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

type ProductSeed = {
  _id: string;
  _type: string;
  name: string;
  slug: { _type: string; current: string };
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  inStock: boolean;
  featured?: boolean;
  materials: string[];
  dimensions: string;
  careInstructions: string;
  collection: { _type: string; _ref: string };
};

const products: ProductSeed[] = [
  // === UKRAINIAN HERITAGE ===
  {
    _id: "product-vyshyvanka-lavender-earrings",
    _type: "product",
    name: "Vyshyvanka Lavender Earrings",
    slug: { _type: "slug", current: "vyshyvanka-lavender-earrings" },
    price: 35,
    imageUrl: "/images/products/ukrainian-heritage/lavender-vyshyvanka-earrings.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay", "Sterling Silver Hooks", "Pearl Beads"],
    dimensions: "4cm drop length, 2.5cm diameter",
    careInstructions: "Avoid water contact. Store in provided box away from direct sunlight.",
    collection: { _type: "reference", _ref: "collection-ukrainian-heritage" },
  },
  {
    _id: "product-red-folk-cross-stitch-earrings",
    _type: "product",
    name: "Red Folk Cross-Stitch Earrings",
    slug: { _type: "slug", current: "red-folk-cross-stitch-earrings" },
    price: 35,
    compareAtPrice: 45,
    imageUrl: "/images/products/ukrainian-heritage/red-folk-earrings.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay", "Sterling Silver Hooks", "Red Crystal Beads"],
    dimensions: "5cm drop length, 2.5cm per disc",
    careInstructions: "Avoid water contact. Store in provided box away from direct sunlight.",
    collection: { _type: "reference", _ref: "collection-ukrainian-heritage" },
  },
  {
    _id: "product-poppy-sunflower-necklace-set",
    _type: "product",
    name: "Poppy & Sunflower Necklace Set",
    slug: { _type: "slug", current: "poppy-sunflower-necklace-set" },
    price: 85,
    imageUrl: "/images/products/ukrainian-heritage/poppy-sunflower-set.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay", "Sterling Silver Chain", "Crystal Beads", "Natural Stones"],
    dimensions: "Necklace: 42cm chain + 5cm extension. Earrings: 3cm drop",
    careInstructions: "Handle with care. Each flower is sculpted by hand. Store flat in box.",
    collection: { _type: "reference", _ref: "collection-ukrainian-heritage" },
  },

  // === YELLOW ROSES ===
  {
    _id: "product-yellow-rose-complete-set",
    _type: "product",
    name: "Yellow Rose Complete Set",
    slug: { _type: "slug", current: "yellow-rose-complete-set" },
    price: 95,
    compareAtPrice: 120,
    imageUrl: "/images/products/yellow-roses/yellow-roses-set-flatlay.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay", "Sterling Silver", "Crystal Beads", "Semi-precious Stones"],
    dimensions: "Necklace: 42cm. Ring: adjustable. Earrings: 1.5cm studs",
    careInstructions: "Store each piece separately. Avoid perfumes and moisture.",
    collection: { _type: "reference", _ref: "collection-yellow-roses" },
  },
  {
    _id: "product-yellow-rose-stud-earrings",
    _type: "product",
    name: "Yellow Rose Stud Earrings",
    slug: { _type: "slug", current: "yellow-rose-stud-earrings" },
    price: 28,
    imageUrl: "/images/products/yellow-roses/yellow-roses-model-detail.jpg",
    inStock: true,
    materials: ["Polymer Clay", "Sterling Silver Posts"],
    dimensions: "1.5cm diameter",
    careInstructions: "Remove before sleeping. Store in provided pouch.",
    collection: { _type: "reference", _ref: "collection-yellow-roses" },
  },
  {
    _id: "product-yellow-rose-bouquet-necklace",
    _type: "product",
    name: "Yellow Rose Bouquet Necklace",
    slug: { _type: "slug", current: "yellow-rose-bouquet-necklace" },
    price: 65,
    imageUrl: "/images/products/yellow-roses/yellow-roses-necklace-closeup.jpg",
    inStock: true,
    materials: ["Polymer Clay Roses", "Sterling Silver Chain", "Agate Beads", "Crystal Beads"],
    dimensions: "42cm chain with 5cm extension, pendant cluster 6cm wide",
    careInstructions: "Handle the floral cluster gently. Store flat.",
    collection: { _type: "reference", _ref: "collection-yellow-roses" },
  },

  // === ORCHID DREAMS ===
  {
    _id: "product-violet-orchid-agate-collection",
    _type: "product",
    name: "Violet Orchid & Agate Collection",
    slug: { _type: "slug", current: "violet-orchid-agate-collection" },
    price: 110,
    imageUrl: "/images/products/orchid-dreams/orchid-violet-collection.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay Orchids", "Sterling Silver", "Purple Agate", "Green Agate", "Crystal Beads"],
    dimensions: "Necklace: 42cm. Earrings available in agate or orchid style",
    careInstructions: "Natural agate stones may vary in pattern. Handle with care.",
    collection: { _type: "reference", _ref: "collection-orchid-dreams" },
  },
  {
    _id: "product-orchid-bouquet-necklace",
    _type: "product",
    name: "Orchid Bouquet Necklace",
    slug: { _type: "slug", current: "orchid-bouquet-necklace" },
    price: 75,
    imageUrl: "/images/products/orchid-dreams/orchid-necklace-agate-display.jpg",
    inStock: true,
    materials: ["Polymer Clay Orchids & Roses", "Sterling Silver Chain", "Crystal Beads"],
    dimensions: "42cm chain with 5cm extension, pendant cluster 7cm wide",
    careInstructions: "Store flat in provided box. Avoid contact with water.",
    collection: { _type: "reference", _ref: "collection-orchid-dreams" },
  },

  // === DARK BLOOM ===
  {
    _id: "product-dark-bloom-earrings-green",
    _type: "product",
    name: "Dark Bloom Flower Earrings - Green",
    slug: { _type: "slug", current: "dark-bloom-earrings-green" },
    price: 32,
    imageUrl: "/images/products/dark-bloom/dark-bloom-set-flatlay.jpg",
    inStock: true,
    materials: ["Polymer Clay", "Sterling Silver Hooks"],
    dimensions: "3cm diameter per flower",
    careInstructions: "Store in provided box. Avoid moisture.",
    collection: { _type: "reference", _ref: "collection-dark-bloom" },
  },
  {
    _id: "product-black-rose-pendant-necklace",
    _type: "product",
    name: "Black Rose Pendant Necklace",
    slug: { _type: "slug", current: "black-rose-pendant-necklace" },
    price: 45,
    imageUrl: "/images/products/dark-bloom/dark-bloom-set-detail.jpg",
    inStock: true,
    materials: ["Polymer Clay", "Sterling Silver Chain"],
    dimensions: "45cm chain, 3cm pendant",
    careInstructions: "Store flat. Handle pendant with care.",
    collection: { _type: "reference", _ref: "collection-dark-bloom" },
  },

  // === PINK ROSES ===
  {
    _id: "product-pink-rose-bracelet",
    _type: "product",
    name: "Pink Rose Bracelet",
    slug: { _type: "slug", current: "pink-rose-bracelet" },
    price: 55,
    imageUrl: "/images/products/pink-roses/pink-roses-bracelet-wrist.jpg",
    inStock: true,
    materials: ["Polymer Clay Roses", "Sterling Silver Chain", "Crystal Beads"],
    dimensions: "18cm with adjustable clasp",
    careInstructions: "Remove before sleeping. Avoid water contact.",
    collection: { _type: "reference", _ref: "collection-pink-roses" },
  },
  {
    _id: "product-pink-rose-beach-set",
    _type: "product",
    name: "Pink Rose Complete Beach Set",
    slug: { _type: "slug", current: "pink-rose-beach-set" },
    price: 120,
    compareAtPrice: 150,
    imageUrl: "/images/products/pink-roses/pink-roses-full-set-beach.jpg",
    inStock: true,
    featured: true,
    materials: ["Polymer Clay Roses", "Sterling Silver", "Crystal Beads", "Semi-precious Stones"],
    dimensions: "Necklace: 42cm. Bracelet: 18cm. Earrings: 2cm studs",
    careInstructions: "Store each piece separately in provided box.",
    collection: { _type: "reference", _ref: "collection-pink-roses" },
  },

  // === RED ROSES ===
  {
    _id: "product-red-rose-bracelet-ring-set",
    _type: "product",
    name: "Red Rose Bracelet & Ring Set",
    slug: { _type: "slug", current: "red-rose-bracelet-ring-set" },
    price: 75,
    imageUrl: "/images/products/red-roses/red-roses-bracelet-ring-detail.jpg",
    inStock: true,
    materials: ["Polymer Clay Roses", "Sterling Silver", "Crystal Beads"],
    dimensions: "Bracelet: 18cm. Ring: adjustable. Earrings: 1.5cm",
    careInstructions: "Handle roses gently. Store in box.",
    collection: { _type: "reference", _ref: "collection-red-roses" },
  },

  // === PEONY DELICATES ===
  {
    _id: "product-peony-crystal-studs",
    _type: "product",
    name: "Peony Crystal Stud Earrings",
    slug: { _type: "slug", current: "peony-crystal-studs" },
    price: 30,
    imageUrl: "/images/products/peony-delicates/peony-crystal-studs-card.jpg",
    inStock: true,
    materials: ["Polymer Clay Peonies", "Sterling Silver Posts", "Swarovski Crystals"],
    dimensions: "2cm diameter",
    careInstructions: "Delicate shimmer finish. Avoid water and perfumes.",
    collection: { _type: "reference", _ref: "collection-peony-delicates" },
  },

  // === MEDITERRANEAN GARDEN ===
  {
    _id: "product-lavender-garden-set",
    _type: "product",
    name: "Lavender Garden Necklace & Earring Set",
    slug: { _type: "slug", current: "lavender-garden-set" },
    price: 95,
    imageUrl: "/images/products/mediterranean-garden/lavender-brown-set-fabric.jpg",
    inStock: true,
    materials: ["Polymer Clay Roses", "Sterling Silver", "Amethyst Beads", "Crystal Beads"],
    dimensions: "Necklace: 42cm + 5cm extension. Earrings: 2.5cm studs",
    careInstructions: "Store flat in provided box. Natural stones may vary.",
    collection: { _type: "reference", _ref: "collection-mediterranean-garden" },
  },

  // === STUD EARRINGS ===
  {
    _id: "product-mini-bouquet-studs",
    _type: "product",
    name: "Mini Bouquet Stud Earrings",
    slug: { _type: "slug", current: "mini-bouquet-studs" },
    price: 25,
    imageUrl: "/images/products/stud-earrings/stud-earrings-trio-cards.jpg",
    inStock: true,
    materials: ["Polymer Clay", "Sterling Silver Posts"],
    dimensions: "1.5cm diameter",
    careInstructions: "Remove before sleeping. Store in provided card.",
    collection: { _type: "reference", _ref: "collection-stud-earrings" },
  },
];

// ── SEED FUNCTIONS ────────────────────────────────────────────────────────────

async function upsertDocument(doc: Record<string, unknown>) {
  const id = doc._id as string;
  try {
    await client.createOrReplace(doc);
    return { id, action: "upserted" };
  } catch (err) {
    return { id, action: "error", error: String(err) };
  }
}

async function seedCollections() {
  console.log(`\nSeeding ${collections.length} collections...`);
  const results = await Promise.all(collections.map(upsertDocument));
  const errors = results.filter((r) => r.action === "error");
  console.log(`  ✓ ${results.length - errors.length} collections upserted`);
  if (errors.length) {
    console.error(`  ✗ ${errors.length} errors:`, errors);
  }
}

async function seedProducts() {
  console.log(`\nSeeding ${products.length} products...`);
  // Seed one by one to avoid race conditions with collection references
  let success = 0;
  let failed = 0;
  for (const product of products) {
    const result = await upsertDocument(product as unknown as Record<string, unknown>);
    if (result.action === "error") {
      console.error(`  ✗ ${result.id}:`, result.error);
      failed++;
    } else {
      console.log(`  ✓ ${product.name}`);
      success++;
    }
  }
  console.log(`\n  ${success} products seeded, ${failed} failed`);
}

async function main() {
  console.log(`\nBlossom Sanity Seed`);
  console.log(`Project: ${projectId}`);
  console.log(`Dataset: ${dataset}`);
  console.log("─────────────────────────────────");

  await seedCollections();
  await seedProducts();

  console.log("\n✅ Sanity seeding complete!");
  console.log(
    "\nNext steps:"
  );
  console.log("  1. Open /studio to verify all products and collections appear");
  console.log("  2. Upload real product images in Sanity Studio");
  console.log(
    "  3. Use the AI Description Generator to add EN/ES/UK descriptions"
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
