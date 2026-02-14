export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-12",
  useCdn: process.env.NODE_ENV === "production",
};

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

export const siteConfig = {
  name: "Blossom Jewellery Art",
  description: "Handcrafted artisan jewelry by Olha — unique pieces inspired by nature and crafted with love in Europe.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://blossomjewelleryart.com",
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
