# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **AI Image Studio** — Full AI-powered image creation tool in admin panel
  - 3 generation modes: Product Enhancement (Gemini Flash), Scene Generator (lifestyle), Full Composition (multi-reference)
  - Brand Model Profile management with 5-slot reference photo grid
  - Image Gallery with search, filtering, favorites, and pagination
  - Storage abstraction layer (local filesystem, ready for R2/S3 swap)
  - Session tracking for cost/usage monitoring
  - Product page integration ("AI Images" quick action per product)
  - 6 API endpoints, 27 new files, Prisma schema extended with 3 models
  - Dependencies: sharp (image processing), piexifjs (EXIF preservation)
- **Health Check Endpoint** (/api/health) — status, uptime, database connectivity check
- **Railway Deployment Config** (railway.toml) — standalone output, health check, restart policy
- **Admin Error Pages** — error.tsx with Sentry capture, not-found.tsx with back-to-dashboard
- **Playwright Test Suite** — 15 smoke tests, 4 browser targets (Chromium, Firefox, WebKit, Mobile Chrome)
- **Sentry Error Tracking**
  - @sentry/nextjs SDK with client, server, and edge config
  - instrumentation.ts hook with onRequestError for server-side error capture
  - Global error boundary and app error boundary both report to Sentry
  - withSentryConfig wrapper with source map upload support
- **Google Analytics 4**
  - GA4 gtag.js integration via next/script (afterInteractive loading)
  - E-commerce event tracking: add_to_cart, begin_checkout, purchase, view_item
  - PurchaseTracker component for server-rendered checkout success page
  - Cart store automatically fires add_to_cart events
- **Performance Optimizations**
  - Dynamic imports for recharts AnalyticsCharts and AIDescriptionGenerator (no SSR)
  - Added sizes prop to 7 Image components for proper srcset selection
- **Open Graph & Social Sharing**
  - Enhanced root layout with OG images (1200x630), alternate locales, language alternates
  - Twitter card with image support
  - Localized OG metadata on homepage
- **Complete i18n Translations**
  - All 15+ remaining storefront pages/components fully translated (Products, CartDrawer, Collections, Blog, Account pages, About, Shipping, Size Guide)
  - 120+ new translation keys added across en.json, es.json, uk.json
  - ICU MessageFormat plural rules for Ukrainian (3 forms) and English/Spanish (2 forms)
  - Server components use getTranslations(), client components use useTranslations()
- **SEO Metadata on All Pages**
  - generateMetadata() with localized titles/descriptions on all 16 storefront pages
  - Client component pages (Cart, Account login/register/addresses) use layout.tsx wrappers for metadata
  - Converted checkout/success from static metadata to generateMetadata
  - metaDescription translation keys added to Products, About, and Cart namespaces in all 3 locales
- **E-Commerce Polish & Integration**
  - Cart page coupon code UI (input, validation, applied discount display, loading state)
  - Checkout locale-aware redirects (Stripe success/cancel URLs include locale prefix)
  - Dynamic sitemap.ts with hreflang alternates for all 3 locales
  - robots.ts blocking /admin, /api, /studio, /account from crawlers
  - Locale-aware 404 not-found page with translations
  - WishlistButton component (heart toggle, auth-aware, on product detail page)
  - Rate limiting middleware for /api/auth/register, /api/coupons/validate, /api/checkout
  - Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
  - All storefront components fully translated (ProductDetail, ProductCard, checkout success, cart recovery)
- **Internationalization (Phase 5)**
  - Full multi-language support with next-intl v4 (English, Spanish, Ukrainian)
  - All 24 storefront pages restructured under /[locale]/ dynamic segment
  - Comprehensive translation files (en.json, es.json, uk.json) covering all UI strings
  - Language switcher with SVG country flags (UK, Spain, Ukraine)
  - Locale-aware navigation (Link, useRouter, usePathname) across all storefront components
  - Middleware combining i18n routing with NextAuth authentication
  - Cyrillic font support for Ukrainian locale
  - ICU message syntax with proper plural rules for Ukrainian (three plural forms)
- **Shipping & Fulfillment (Phase 6)**
  - Order fulfillment workflow page with packing slip, item checklist, carrier selection
  - PDF invoice generation with jsPDF (branded header, items table, totals)
  - Shipping notification email sent automatically when order marked as SHIPPED
  - Delivery confirmation email with care instructions sent on DELIVERED
  - Shipping zone/method CRUD API with delete protection for zones with orders
  - Interactive shipping admin page (add/toggle/delete zones and methods)
- **E-Commerce Backend Infrastructure (Phase 0)**
  - Prisma 7 ORM with full database schema (17 models, 8 enums) for orders, inventory, customers, coupons, shipping, offers, wishlists, email logs
  - NextAuth v5 (Auth.js) with JWT strategy, Credentials + Google OAuth providers, role-based access control (Admin, Product Manager, Customer)
  - Middleware for admin panel and customer account route protection
  - Resend email client with transactional email helper
  - Anthropic Claude AI client with multilingual product description generator (EN/ES/UK)
  - Notion API client for project management integration (roadmap, tasks, products)
  - Admin/PM seed script with 5 shipping zones and 10 shipping methods
  - Node.js upgraded to v20.19.0 (Prisma 7 requirement)
  - Neon PostgreSQL database created (project: delicate-thunder-60781733, region: aws-eu-central-1)
  - Database migrated and seeded (admin user, product manager, 5 shipping zones, 10 methods)
- **Admin Panel - Core (Phase 1)**
  - Admin layout shell with responsive sidebar navigation (10 sections)
  - Admin login page with NextAuth credentials authentication
  - Dashboard with KPIs (today's revenue/orders, month comparison, pending orders, low stock alerts)
  - Orders management: list with status filters, detail page with item breakdown, status transitions, shipping tracking
  - Inventory management: stock levels table, restock/adjust actions with stock movements
  - Customers management: list with order count/spending, detail with order history and addresses
  - Reusable admin components: StatsCard, StatusBadge, DataTable, EmptyState, Sidebar, AdminHeader
  - API routes: order status updates (PATCH), inventory adjustments (POST)
  - Coupons management: list page with status badges, create form with validation
  - Offers management: list page with type/discount/status, create form (5 offer types)
  - Shipping zones view: zone cards with methods table, rates, delivery times, free shipping thresholds
  - Products management: combined Sanity CMS + PostgreSQL inventory view, stock status indicators
  - Marketing dashboard: abandoned cart stats, recovery rate, recent carts, quick actions
  - Analytics dashboard: revenue area chart, order status pie chart, top products bar chart, KPI cards
- **E-Commerce Engine (Phase 2)**
  - Enhanced checkout flow: coupon validation, shipping calculation, inventory reservation, Stripe integration
  - Stripe webhook: full order creation pipeline (order + items + status history + inventory + email)
  - Coupon validation API: code, date, usage limits, min order, product/collection scope
  - Shipping rate calculation API: zone lookup by country code, free shipping threshold
  - Order number generation (BLM-2026-XXXX sequential format)
  - Guest checkout support (guestEmail, guestName in order)
  - Inventory reservation/release on checkout session create/expire
  - Stripe native discount coupons for percentage and fixed amount
- **Customer Account System**
  - Customer login page (email/password + Google OAuth with branded Google button)
  - Customer registration with auto sign-in (password validation, duplicate check)
  - Account dashboard with order/address/wishlist stats and recent orders
  - Order history page with item details, status badges, tracking info
  - Saved addresses page (CRUD with default address support, country selector)
  - Wishlist page with Sanity product integration and remove functionality
  - Auth middleware updated for /account routes (allow login/register without auth)
  - API endpoints: /api/auth/register, /api/account/addresses, /api/account/wishlist
- **AI Content Generation (Phase 3)**
  - AI description API endpoint (/api/ai/describe) with admin auth
  - AIDescriptionGenerator admin component (textarea input, language selector, product metadata)
  - Trilingual generation: English, Spanish, Ukrainian simultaneously
  - Per-field copy-to-clipboard with visual feedback
  - Language tabs for viewing generated content
  - Integrated into admin products page
- **Email Templates (React Email)**
  - Branded email layout component (Georgia serif, minimal design, Blossom branding)
  - Order confirmation template (items table, totals, shipping address, discount display)
  - Shipping notification template (tracking info, carrier, estimated delivery, CTA)
  - Welcome email template (personalized greeting, brand story, collection CTA)
  - Cart recovery template (3 stages: 1h reminder, 24h urgency, 48h with discount code)
- **Marketing & Recovery System (Phase 4)**
  - Abandoned cart detection cron endpoint (/api/cron/abandoned-carts)
  - 3-stage email recovery sequence with de-duplication
  - Auto-generated 10% discount coupon for 48h stage recovery
  - Cart session abandonment tracking
- **Contact Form Submission**
  - ContactForm client component with loading/success/error states
  - /api/contact API route with Zod validation and Resend email delivery
  - Contact page updated to use component instead of non-functional inline form
- **Newsletter Signup**
  - NewsletterForm component with light/dark variants (homepage/footer)
  - /api/newsletter API route with Prisma upsert (graceful DB fallback)
  - NewsletterSubscriber Prisma model added to schema
- **Product Search**
  - SearchDialog component with Cmd+K keyboard shortcut
  - Debounced search (300ms) with result thumbnails and prices
  - /api/search route searching Sanity with mock data fallback
  - Replaces dummy search button in header
- **Shipping Selection UI**
  - Country dropdown (25 countries) on cart page
  - Shipping method radio buttons with rate display
  - Shipping cost included in order total
  - /api/shipping/calculate enhanced with hardcoded fallback zones
- **Order Detail Page**
  - /account/orders/[id] page with order info, items, financials, tracking, address
  - "View Details" links added to order history list
  - PATCH method added to addresses API with ownership verification
- **Toast Notifications**
  - Radix Toast notification system (success/error/info variants)
  - ToastProvider wrapping all storefront content
  - "Add to Cart" action fires success toast with product name
- **Loading Skeletons**
  - Skeleton loading states for products, collections, and blog routes

### Fixed
- Checkout discount bug: removed fragile `lineItems.pop()` pattern, now creates Stripe coupon directly
- Site URL corrected from blossomjewelleryart.com to blossomjewellery.art in env config
- Instagram URL corrected to https://instagram.com/blossomjewelleryart in footer and contact page
- Email address corrected to hello@blossomjewellery.art across all pages
- Footer hardcoded English strings replaced with translation calls
- "Related Products" heading now translatable via extracted server component
- Sanity webhook rewritten to use upsert (was create-only, ignoring updates)
- Sanity webhook now handles variant-level inventory and delete events
- React 19 useRef compatibility: added required initial value parameter
- Build error: `next/dynamic` with `ssr: false` in server components (extracted to client wrapper components)
- Environment variable non-null assertions (`!`) replaced with safe fallback helpers (envOrWarn, envOrDefault)
- next-sitemap.config.js URL corrected and missing /admin, /account exclusions added
- Debug screenshots (24 files) removed from git tracking, .gitignore updated

### Changed
- Next.js output mode set to "standalone" for optimized production deployments
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
