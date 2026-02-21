function envOrDefault(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function envOrWarn(key: string, fallback = ""): string {
  const val = process.env[key];
  if (!val && typeof window === "undefined") {
    console.warn(`[env] Missing ${key} — using fallback`);
  }
  return val || fallback;
}

export const sanityConfig = {
  projectId: envOrDefault("NEXT_PUBLIC_SANITY_PROJECT_ID", ""),
  dataset: envOrDefault("NEXT_PUBLIC_SANITY_DATASET", "production"),
  apiVersion: envOrDefault("NEXT_PUBLIC_SANITY_API_VERSION", "2026-02-12"),
  useCdn: process.env.NODE_ENV === "production",
};

export const stripeConfig = {
  secretKey: envOrWarn("STRIPE_SECRET_KEY"),
  publishableKey: envOrDefault("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", ""),
  webhookSecret: envOrWarn("STRIPE_WEBHOOK_SECRET"),
};

export const siteConfig = {
  name: "Blossom Jewellery Art",
  description: "Handcrafted artisan jewelry by Olha — unique pieces inspired by nature and crafted with love in Europe.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://blossomjewellery.art",
  ogImage: "/og-image.jpg",
  creator: "Olha",
  keywords: [
    "handmade jewelry",
    "artisan jewelry",
    "nature-inspired jewelry",
    "handcrafted earrings",
    "botanical jewelry",
    "unique jewelry",
    "European jewelry",
    "blossom jewelry",
  ],
};
