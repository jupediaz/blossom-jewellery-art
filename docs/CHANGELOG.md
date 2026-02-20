# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **E-Commerce Backend Infrastructure (Phase 0)**
  - Prisma 7 ORM with full database schema (17 models, 8 enums) for orders, inventory, customers, coupons, shipping, offers, wishlists, email logs
  - NextAuth v5 (Auth.js) with JWT strategy, Credentials + Google OAuth providers, role-based access control (Admin, Product Manager, Customer)
  - Middleware for admin panel and customer account route protection
  - Resend email client with transactional email helper
  - Anthropic Claude AI client with multilingual product description generator (EN/ES/UK)
  - Notion API client for project management integration (roadmap, tasks, products)
  - Admin/PM seed script with 5 shipping zones and 10 shipping methods
  - Node.js upgraded to v20.19.0 (Prisma 7 requirement)

### Changed
- Updated `.env.example` with all new environment variables (database, auth, email, AI, Notion)
- Updated `.gitignore` to exclude Prisma generated client
- Added `prisma.config.ts` for Prisma 7 configuration (replaces in-schema URL)
- Added database management scripts to `package.json` (db:generate, db:migrate, db:push, db:seed, db:studio)

- **Photo Organization System** - 48 original images analyzed, categorized, and optimized for web
  - Hero images (1920px): 3 options + main hero replacement
  - About/Artisan images (1500px): 4 images (portraits, workshop, crafting process)
  - Collection covers (1200px): 8 collection cover images
  - Product images (1000px): 40 product photos organized by collection
  - AI avatar reference photos (1024px): 12 training images of Olha
  - Directory structure: `public/images/{hero,about,collections,products/*,models}/`

- **9 Product Collections** defined from actual jewelry inventory:
  1. Ukrainian Heritage (vyshyvanka earrings, poppy/sunflower sets)
  2. Red Roses (bracelets, rings, earrings)
  3. Pink Roses (full sets, bracelets)
  4. Yellow Roses (complete sets, studs, necklaces)
  5. Orchid Dreams (orchids + agate stones)
  6. Dark Bloom (black, green, blue flowers)
  7. Peony Delicates (shimmer peonies + Swarovski)
  8. Mediterranean Garden (mixed bouquet sets)
  9. Stud Earrings (mini bouquet studs)

- **17 Real Products** in mock data with actual photos, descriptions, pricing, and materials
  - Replaced all Unsplash placeholder images with real product photography
  - Products linked to collections with proper slugs

- **AI Avatar Pipeline** (`scripts/ai-avatar/`)
  - `enhance-photos.ts` - Gemini-powered photo enhancement script
    - 6 background presets (studio-white, marble, botanical, Mediterranean, velvet, gallery)
    - Supports single image, batch processing, and custom prompts
    - Uses NanoBanana Pro (gemini-3-pro-image-preview)
  - `README.md` - Complete documentation for avatar training pipeline
    - Flux LoRA training options (Replicate, fal.ai, RunPod)
    - 12 reference photos cataloged with descriptions
    - 6 ideal generation scenarios documented
  - Gemini API key integrated from image-metadata project

- **Homepage Updated** - Collection images now dynamically mapped to real photos by slug

- **About Page Rewritten** - Full artisan story page with real photos
  - Hero section with Olha's portrait and biography
  - "The Craft" section with crafting process photo
  - "What Makes Blossom Special" values (Handcrafted, Nature-Inspired, Quality Materials)
  - "The Workshop" section with atelier photo
  - Creative process steps (Inspiration → Sculpting → Assembly → Finishing)
  - CTA section linking to Shop and Collections

- **Collections Page Improved** - 3-column grid with real cover photos
  - Slug-based image mapping (same as homepage) for all 9 collections
  - Description and piece count shown on each card
  - Singular/plural piece count ("1 piece" vs "3 pieces")

- **Collection Detail Pages Enhanced**
  - Hero banner with collection cover image and description overlay
  - Breadcrumb navigation back to All Collections
  - Fixed product filtering: now uses `collection._id` match instead of broken index-based math
  - Piece count displayed

- **Products Page Enhanced**
  - Collection-based filter pills for mock data (9 collection filters)
  - Sort options (Price low/high, Name) with collection-preserving URLs
  - Product cards now show collection name below product name

- **Product Detail Page Fixed**
  - Product image now renders from `imageUrl` when Sanity images are empty (was showing ShoppingBag placeholder)
  - Collection name shown as link to collection page
  - Sale badge on discounted products
  - Related products now prioritize same-collection items
  - Removed hardcoded "Product description" placeholder text

- Registered idea in CodeLabs Hub (ID: 4e8c25f9-984d-476d-ba23-7eba47da88ff)
  - All 10 analysis sections populated with research data
  - Score: 82/100
  - Accessible at hub.codelabs.studio

- Naming & domain strategy document (docs/NAMING_RATIONALE.md)
  - 6 brand name options with selection mechanism
  - 20+ domain availability checks (verified via WHOIS)
  - Top 3 recommendations with directory names
  - Trademark risk analysis

- Comprehensive market analysis (docs/MARKET_ANALYSIS.md)
  - Global polymer clay market overview ($2B market, 4.2% CAGR)
  - Spain jewelry market analysis ($5.89B, growing to $9.23B by 2033)
  - Marbella/Costa del Sol local market analysis
  - Competitor analysis (Etsy, independent, gallery-level)
  - Amazon Handmade/FBA viability assessment
  - Consumer demographics and trends

- Brand strategy document (docs/BRAND_STRATEGY.md)
  - Brand positioning: "Artisan wearable botanical art"
  - 3 target customer personas
  - Brand voice and storytelling framework
  - Instagram content strategy (5 pillars)
  - B2B boutique approach strategy
  - Packaging strategy (6-12 EUR/order premium experience)
  - Visual identity (color palette, typography, photography)
  - 4-phase execution roadmap

- Pricing strategy (docs/PRICING_STRATEGY.md)
  - Retail pricing: Earrings 45-120 EUR, Necklaces 80-250 EUR, Bracelets 60-150 EUR
  - Wholesale model: 50% of retail
  - Multi-channel fee comparison
  - Financial targets: Year 1 10-30K EUR revenue

- Platform comparison (docs/PLATFORM_COMPARISON.md)
  - Shopify vs Squarespace vs Custom (Next.js) vs Etsy vs Amazon
  - Cost analysis for each platform
  - Recommended multi-channel strategy
  - Theme recommendations (Mavon Jewelry for Shopify)

- Feature tracking (docs/FEATURE_TRACKING.md)
- Project changelog (docs/CHANGELOG.md)
- Instagram screenshots for reference (docs/images/)

## [0.0.1] - 2026-02-12

### Added
- Initial project setup
- Reference images from Instagram (@blossomjewelleryart, @olhafiniv)
