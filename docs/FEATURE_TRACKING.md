# Blossom Jewelry - Feature Tracking

Last Updated: 2026-02-20

## Legend
- Planned - Designed but not started
- In Progress - Currently being implemented
- Implemented - Complete, needs testing
- Complete - Tested and deployed
- Paused - On hold
- Cancelled - Will not implement

---

## Research & Strategy

### Market Analysis
**Status:** Complete
**Completed:** 2026-02-12

- [x] Global polymer clay jewelry market research
- [x] Pricing tier analysis (mass-produced to gallery-level)
- [x] Online competitor analysis (Etsy, independent, Instagram)
- [x] Marbella/Costa del Sol local market analysis
- [x] Demographics and consumer profiles
- [x] Amazon Handmade/FBA viability assessment
- [x] Key success factors identified

**Output:** docs/MARKET_ANALYSIS.md

---

### Brand Strategy
**Status:** Complete
**Completed:** 2026-02-12

- [x] Brand positioning defined
- [x] Brand voice and personality guidelines
- [x] Target customer personas (3 personas)
- [x] Value proposition statement
- [x] Brand storytelling framework
- [x] Instagram strategy and content pillars
- [x] B2B boutique approach strategy
- [x] Packaging strategy and suppliers
- [x] Visual identity (colors, typography, photography)
- [x] Execution roadmap (4 phases)

**Output:** docs/BRAND_STRATEGY.md

---

### Pricing Strategy
**Status:** Complete
**Completed:** 2026-02-12

- [x] Market pricing benchmarks
- [x] Recommended retail pricing by product type
- [x] Wholesale pricing structure (50% model)
- [x] Sales channel fee comparison
- [x] Financial targets (Year 1-3)
- [x] Price anchoring tactics

**Output:** docs/PRICING_STRATEGY.md

---

### Platform Comparison
**Status:** Complete
**Completed:** 2026-02-12

- [x] Shopify analysis (plans, themes, costs)
- [x] Squarespace analysis
- [x] Custom Next.js analysis
- [x] Etsy fee analysis
- [x] Amazon Handmade fee analysis
- [x] Total annual cost comparison
- [x] Multi-channel strategy recommendation

**Output:** docs/PLATFORM_COMPARISON.md

---

## Implementation

### Website / E-Commerce Store
**Status:** In Progress
**Priority:** Critical
**Started:** 2026-02-12

Features:
- [x] Choose platform: Custom Next.js 16 + Sanity CMS + Stripe
- [ ] Purchase domain (blossomjewellery.art selected)
- [x] Set up store with jewelry theme (Next.js + Tailwind 4)
- [x] Create "About" page with brand story (rewritten with real photos: portrait, workshop, crafting)
- [x] Product photography - 48 images analyzed, optimized, and organized
- [x] Product listings with descriptions (16 products, 9 collections)
- [x] Collection pages with cover images, descriptions, and filtered products
- [x] Product detail pages with real images, collection links, sale badges, related products
- [x] Products page with collection filtering and sorting
- [x] Stripe payment integration (configured, needs keys)
- [ ] Instagram Shopping connection
- [x] Multi-language support (next-intl configured)
- [x] Mobile-responsive design (Tailwind responsive)
- [x] SEO optimization (JSON-LD, sitemap, meta tags)
- [x] Brand palette redesign: sage green → soft blush rose + warm gold (2026-02-20)
- [x] Editorial hero redesign: bottom-anchored text, full-bleed, dramatic typography
- [x] Middleware fix: removed edge runtime incompatibility (crypto/bcryptjs)
- [x] Font size: 16px → 18px for better readability
- [ ] Sanity CMS populated with real content
- [ ] Deploy to production

**Technical Stack:**
- Next.js 16 + React 19
- Sanity CMS (headless)
- Stripe (payments)
- Zustand (state management)
- Tailwind CSS 4
- Framer Motion (animations)
- next-intl (i18n)
- Radix UI (components)

---

### Brand Visual Identity
**Status:** In Progress
**Priority:** High
**Target:** 2026-02/03

Features:
- [ ] Logo design (wordmark + icon)
- [x] Color palette finalized: soft blush rose (#F0D0D0) + warm gold (#C4A060) + white
- [x] Typography selected: Cormorant Garamond (headings) + Inter (body)
- [ ] Brand guidelines document
- [ ] Social media templates
- [ ] Business cards designed
- [ ] Product photography style guide
- [ ] Packaging design (box, pouch, cards)

**Notion Integration:**
- [x] @notionhq/client installed (v5.9.0)
- [x] .env.example variables: NOTION_API_KEY, NOTION_ROADMAP_DB_ID, NOTION_TASKS_DB_ID, NOTION_PRODUCTS_DB_ID
- [ ] Notion workspace created (pending user account setup)
- [ ] Databases created in Notion
- [ ] Roadmap + task boards populated

---

### Instagram Growth
**Status:** Planned
**Priority:** High
**Target:** Ongoing from 2026-03

Features:
- [ ] Profile optimization (bio, highlights, link)
- [ ] Content buffer (15-20 pieces pre-launch)
- [ ] Posting schedule (3-4x/week)
- [ ] Reels strategy (process videos)
- [ ] Hashtag strategy implementation
- [ ] Influencer outreach (3-5 micro-influencers)
- [ ] Instagram Shopping setup

---

### B2B / Wholesale
**Status:** Planned
**Priority:** Medium
**Target:** 2026-04

Features:
- [ ] Wholesale lookbook (digital + print)
- [ ] Wholesale terms sheet
- [ ] Target boutique list (Marbella)
- [ ] Approach first 3-5 boutiques
- [ ] Consignment agreements
- [ ] Display materials for boutiques

---

### AI Photography & Avatar Pipeline
**Status:** In Progress
**Priority:** Medium
**Started:** 2026-02-17

Features:
- [x] Collect Olha's photos for AI training (12 reference images prepared)
- [x] Gemini integration for photo enhancement (NanoBanana Pro)
  - 6 background presets (studio, marble, botanical, Mediterranean, velvet, gallery)
  - Batch processing support
  - EXIF preservation from image-metadata project
- [ ] Create AI-enhanced lifestyle imagery (Gemini enhance script ready)
- [ ] Train Flux LoRA model on Olha's reference photos
- [ ] Generate editorial campaign images
- [ ] Background environments for product shots
- [ ] Mood boards and campaign visuals

**Technical Details:**
- Script: `scripts/ai-avatar/enhance-photos.ts`
- Models: gemini-3-pro-image-preview, gemini-2.5-flash-image
- Training data: 12 images in `/public/images/models/`
- Planned training: Flux LoRA via Replicate or fal.ai

---

### AI Image Studio (Admin)
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-21

Full AI-powered image creation tool in the admin panel. Three modes for creating professional product photography, lifestyle marketing images, and brand model compositions using Google Gemini.

Features:
- [x] Prisma schema: BrandModelProfile, GeneratedImage, ImageGenerationSession models + enums
- [x] Core AI library: gemini-image.ts (ported from image-metadata), storage abstraction, types, scene presets
- [x] Upload API (/api/ai/image/upload) — multipart upload with auth, validation, 10MB limit
- [x] Model Profile API (/api/ai/model-profile) — GET/POST brand model reference photos
- [x] Model Profile page (/admin/ai-studio/model-profile) — 5-slot photo grid with drag-and-drop
- [x] Enhancement API (/api/ai/image/enhance) — single image enhancement with session tracking
- [x] Enhancement Mode (Mode B) — upload product photo, enhancement presets, Flash/Pro model selection
- [x] Generation API (/api/ai/image/generate) — multi-reference generation with model profile loading
- [x] Scene Generator (Mode A) — brand model toggle, scene presets, aspect ratio, variations, pose reference
- [x] Full Composition (Mode C) — experimental multi-reference, 14-image capability, Pro model forced
- [x] Gallery API (/api/ai/image + /api/ai/image/[id]) — paginated list, filters, CRUD, delete with file cleanup
- [x] Gallery page (/admin/ai-studio/gallery) — responsive grid, search, mode filter, favorites, pagination
- [x] Image Detail Modal — full metadata, download, favorite, delete actions
- [x] Zustand store (ai-studio.ts) — generation state, preselected product context
- [x] Product page integration — "AI Images" button per product row linking to studio
- [x] Sidebar navigation — AI Studio between Marketing and Analytics
- [x] Shared components: ImageDropzone, PromptInput, ModelSelector, GenerationResults, StudioTabs

**Architecture:**
- 3 modes as tabs: Product Enhancement | Scene Generator | Full Composition
- Storage abstraction (ImageStorageProvider interface) — local filesystem now, R2/S3 swap later
- Session tracking for every API call (cost/usage monitoring)
- Rate limiting: 10 req/min (enhance), 5 req/min (generate)
- Gemini models: Flash (fast enhancement), Pro (multi-reference generation)

**Files Created (27):**
- `src/lib/ai/gemini-image.ts`, `types.ts`, `storage.ts`, `scene-presets.ts`
- `src/lib/store/ai-studio.ts`
- `src/app/api/ai/image/upload/route.ts`, `enhance/route.ts`, `generate/route.ts`, `route.ts`, `[id]/route.ts`
- `src/app/api/ai/model-profile/route.ts`
- `src/app/admin/ai-studio/page.tsx`, `StudioTabsLoader.tsx`
- `src/app/admin/ai-studio/model-profile/page.tsx`
- `src/app/admin/ai-studio/gallery/page.tsx`
- `src/components/admin/ai-studio/StudioTabs.tsx`, `EnhanceMode.tsx`, `SceneMode.tsx`, `ComposeMode.tsx`
- `src/components/admin/ai-studio/ImageDropzone.tsx`, `PromptInput.tsx`, `ModelSelector.tsx`, `GenerationResults.tsx`
- `src/components/admin/ai-studio/ModelProfileEditor.tsx`, `ImageGallery.tsx`, `ImageDetailModal.tsx`

**Files Modified (3):**
- `prisma/schema.prisma` — 3 new models, 2 enums, User relation
- `src/components/admin/Sidebar.tsx` — AI Studio nav item
- `src/app/admin/products/page.tsx` — "AI Images" quick action per product

**Dependencies Added:**
- `sharp` (image processing, thumbnails)
- `piexifjs` (EXIF metadata preservation)

---

### Amazon Handmade
**Status:** Planned
**Priority:** Low
**Target:** 2026-Q3

Features:
- [ ] Amazon Seller account setup
- [ ] Handmade artisan application
- [ ] Product listings (standardized pieces only)
- [ ] FBM fulfillment setup
- [ ] SEO optimization for Amazon search

---

### Packaging
**Status:** Planned
**Priority:** Medium
**Target:** 2026-03

Features:
- [ ] Design box with logo
- [ ] Order linen pouches
- [ ] Print thank-you cards
- [ ] Print care instruction cards
- [ ] Source dried flowers
- [ ] Calculate per-unit packaging cost

---

### E-Commerce Platform Backend (Phase 0: Infrastructure)
**Status:** Implemented
**Priority:** Critical
**Started:** 2026-02-20

Features:
- [x] Install all backend dependencies (Prisma, NextAuth, Resend, Claude AI SDK, Notion, Zod, etc.)
- [x] Create Prisma schema (17 models: User, Order, Inventory, Coupon, CartSession, ShippingZone, etc.)
- [x] Configure Prisma 7 with prisma.config.ts and PrismaPg adapter
- [x] Set up Prisma client singleton with connection pooling guard
- [x] Configure NextAuth v5 (JWT strategy, Credentials + Google OAuth providers, role-based access)
- [x] Create auth API route handler (/api/auth/[...nextauth])
- [x] Create middleware for /admin/* and /account/* route protection
- [x] Create Resend email client with helper function
- [x] Create Anthropic Claude AI client with product description generator
- [x] Create Notion API client with task/roadmap helpers
- [x] Create admin seed script (admin + product manager users, shipping zones/methods)
- [x] Update .env.example with all new environment variables
- [x] TypeScript compiles clean (zero errors)
- [x] Set up Neon PostgreSQL database (project: delicate-thunder-60781733)
- [x] Run initial Prisma migration (20260220081643_init)
- [x] Seed database (admin/PM users, 5 shipping zones, 10 methods)
- [ ] Verify admin login works end-to-end
- [ ] Configure Sanity project (project ID, dataset, API token)

### Admin Panel - Core (Phase 1)
**Status:** Implemented
**Priority:** Critical
**Started:** 2026-02-20

Features:
- [x] Admin layout shell (sidebar navigation, responsive design)
- [x] Admin login page (email/password, NextAuth integration)
- [x] Admin dashboard with KPIs (today's revenue/orders, pending orders, low stock alerts, recent orders)
- [x] Orders management (list with status filters, detail page with timeline, status transitions, shipping info)
- [x] Inventory management (stock levels, adjust actions, low stock alerts)
- [x] Customers management (list, detail with order history, addresses, stats)
- [x] Coupons management (list, create form, duplicate code check)
- [x] Offers management (list, create form, flash sales/seasonal/clearance)
- [x] Shipping zones view (zones, methods, free shipping thresholds)
- [x] Products management (Sanity + inventory combined view, stock status badges)
- [x] AI Description Generator (trilingual EN/ES/UK, Claude-powered, copy-to-clipboard)
- [x] Marketing dashboard (abandoned carts, recovery rate, quick actions)
- [x] Analytics dashboard (revenue chart, order status breakdown, top products, KPIs)
- [x] Reusable admin components (StatsCard, StatusBadge, DataTable, EmptyState, Sidebar, AdminHeader)
- [x] API endpoints for orders, inventory, coupons, offers, analytics

**Files Created:**
- `src/app/admin/layout.tsx`, `AdminShell.tsx` - Admin shell
- `src/app/admin/page.tsx` - Dashboard
- `src/app/admin/login/page.tsx`, `layout.tsx` - Login
- `src/app/admin/orders/page.tsx`, `[id]/page.tsx`, `[id]/OrderActions.tsx` - Orders
- `src/app/admin/inventory/page.tsx`, `InventoryActions.tsx` - Inventory
- `src/app/admin/customers/page.tsx`, `[id]/page.tsx` - Customers
- `src/app/admin/coupons/page.tsx`, `new/page.tsx` - Coupons
- `src/app/admin/offers/page.tsx`, `new/page.tsx` - Offers
- `src/app/admin/shipping/page.tsx` - Shipping zones
- `src/app/admin/products/page.tsx` - Products + AI generator
- `src/app/admin/marketing/page.tsx` - Marketing dashboard
- `src/app/admin/analytics/page.tsx`, `AnalyticsCharts.tsx` - Analytics
- `src/components/admin/` - StatsCard, StatusBadge, DataTable, EmptyState, Sidebar, AdminHeader, AIDescriptionGenerator

### E-Commerce Engine (Phase 2)
**Status:** Implemented
**Priority:** Critical
**Started:** 2026-02-20

Features:
- [x] Enhanced checkout flow (coupon validation, shipping calculation, inventory reservation)
- [x] Stripe Checkout integration with full metadata (items, coupon, shipping, customer)
- [x] Webhook processing (order creation, inventory conversion, coupon increment, email)
- [x] Coupon validation API (/api/coupons/validate) - code, dates, limits, scope, min order
- [x] Shipping rate calculation API (/api/shipping/calculate) - zone lookup, free threshold
- [x] Inventory reservation during checkout, release on session expiry
- [x] Order number generation (BLM-2026-XXXX)
- [x] Guest checkout support (guestEmail, guestName)

**Files Created:**
- `src/app/api/checkout/route.ts` - Enhanced checkout with coupons, shipping, inventory
- `src/app/api/webhook/route.ts` - Full order processing pipeline
- `src/app/api/coupons/validate/route.ts` - Coupon validation
- `src/app/api/shipping/calculate/route.ts` - Shipping rate calculation
- `src/app/api/admin/coupons/route.ts` - Coupon creation
- `src/app/api/admin/offers/route.ts` - Offer creation
- `src/app/api/admin/analytics/route.ts` - Analytics data

### Customer Account (Phase 2)
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-20

Features:
- [x] Customer login page (email/password + Google OAuth)
- [x] Customer registration page (with auto sign-in)
- [x] Account dashboard (order count, addresses, wishlist stats, recent orders)
- [x] Order history page (items, status, tracking, totals)
- [x] Saved addresses page (CRUD, default address support)
- [x] Wishlist page (Sanity product integration, remove functionality)
- [x] Auth middleware for /account/* routes (allow login/register without auth)
- [x] Registration API endpoint (/api/auth/register)
- [x] Account API endpoints (addresses CRUD, wishlist CRUD)

**Files Created:**
- `src/app/account/layout.tsx` - Account shell with navigation
- `src/app/account/page.tsx` - Account dashboard
- `src/app/account/login/page.tsx`, `layout.tsx` - Customer login
- `src/app/account/register/page.tsx`, `layout.tsx` - Registration
- `src/app/account/orders/page.tsx` - Order history
- `src/app/account/addresses/page.tsx` - Saved addresses
- `src/app/account/wishlist/page.tsx`, `WishlistRemoveButton.tsx` - Wishlist
- `src/app/api/auth/register/route.ts` - Registration API
- `src/app/api/account/addresses/route.ts` - Addresses API
- `src/app/api/account/wishlist/route.ts` - Wishlist API

### AI Content Generation (Phase 3)
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-20

Features:
- [x] AI product description API (/api/ai/describe) - trilingual generation
- [x] AIDescriptionGenerator admin component (input in any language, auto-detect)
- [x] Claude API integration with brand-voice prompt engineering
- [x] Generates: name, short/long description, materials, SEO title/description, Instagram caption
- [x] All content generated in EN, ES, UK simultaneously
- [x] Copy-to-clipboard per field per language
- [x] Integrated into admin products page

### Email Templates (Phase 4 partial)
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-20

Features:
- [x] React Email layout component (branded header, footer, Georgia serif font)
- [x] Order confirmation email (items, totals, shipping address)
- [x] Shipping notification email (tracking number, carrier, items)
- [x] Welcome email (personalized, brand story, CTA)
- [x] Cart recovery email (3 stages: 1h reminder, 24h urgency, 48h with 10% discount)

**Files Created:**
- `src/emails/components/Layout.tsx` - Shared email layout
- `src/emails/order-confirmation.tsx` - Order confirmed template
- `src/emails/shipping-notification.tsx` - Shipping notification template
- `src/emails/welcome.tsx` - Welcome email template
- `src/emails/cart-recovery.tsx` - Abandoned cart recovery (3 stages)

### Marketing & Recovery (Phase 4)
**Status:** Implemented
**Priority:** Medium
**Started:** 2026-02-20

Features:
- [x] Abandoned cart detection cron endpoint (/api/cron/abandoned-carts)
- [x] 3-stage recovery email sequence (1h, 24h, 48h with auto-generated discount)
- [x] Cart session tracking (lastActivityAt, abandonedAt, recoveryEmailSent)
- [x] Marketing admin dashboard (abandoned cart count, recovery rate, recent carts, quick actions)
- [x] Email logging (all recovery emails tracked in EmailLog)

---

## Remaining Phases (Planned)

### Internationalization (Phase 5)
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-20

- [x] next-intl v4 routing configuration (defineRouting with en/es/uk, localePrefix: as-needed)
- [x] i18n request config (getRequestConfig with locale validation)
- [x] Locale-aware navigation helpers (Link, redirect, usePathname, useRouter)
- [x] Middleware combining next-intl routing + NextAuth authentication
- [x] All 24 storefront pages moved under /[locale]/ prefix
- [x] Translation files: en.json, es.json, uk.json (comprehensive UI strings)
- [x] Header/Footer translated with useTranslations hook
- [x] Language switcher component (SVG flags for UK/ES/UA, dropdown)
- [x] Locale-aware Link imports across all storefront components (ProductCard, CartDrawer, etc.)
- [x] Cyrillic font support (Inter + Cormorant Garamond with cyrillic subset)
- [x] HtmlLangUpdater component for dynamic HTML lang attribute
- [x] next.config.ts updated with createNextIntlPlugin
- [x] generateStaticParams for locale routes
- [x] Build passes clean with all 3 locale variants generating

**Files Created:**
- `src/i18n/routing.ts` - Locale configuration
- `src/i18n/request.ts` - Server request config
- `src/i18n/navigation.ts` - Locale-aware navigation API
- `messages/en.json`, `messages/es.json`, `messages/uk.json` - Translations
- `src/app/[locale]/layout.tsx` - Locale layout with NextIntlClientProvider
- `src/components/LanguageSwitcher.tsx` - Language switcher with SVG flags
- `src/components/HtmlLangUpdater.tsx` - Dynamic HTML lang attribute

**Files Modified:**
- `src/app/layout.tsx` - Simplified to bare HTML shell
- `src/middleware.ts` - Combined i18n + auth middleware
- `src/lib/auth.ts` - Updated authorized callback for locale-prefixed paths
- `next.config.ts` - Added createNextIntlPlugin
- All 24+ storefront pages/components: Link imports updated to @/i18n/navigation

### Shipping & Fulfillment (Phase 6)
**Status:** Implemented
**Priority:** Medium
**Started:** 2026-02-20

- [x] Fulfillment workflow page (packing slip, checklist, carrier selection, tracking number)
- [x] Order detail API (GET /api/admin/orders/[id])
- [x] PDF invoice generation with jsPDF (header, items table, totals, footer)
- [x] Invoice API endpoint (GET /api/orders/[id]/invoice with auth check)
- [x] Shipping notification email sent on status change to SHIPPED
- [x] Delivery confirmation email template + sent on status change to DELIVERED
- [x] Email logging for all status change notifications
- [x] Shipping zone CRUD API (GET/POST zones, PATCH/DELETE zone by ID)
- [x] Shipping method CRUD API (POST method, PATCH/DELETE by ID)
- [x] Interactive shipping admin page (add zones/methods, toggle active/inactive, delete)
- [x] Delete protection (cannot delete zones/methods with existing orders)

**Files Created:**
- `src/app/admin/orders/[id]/fulfill/page.tsx` - Fulfillment workflow
- `src/app/api/admin/orders/[id]/route.ts` - Order detail endpoint
- `src/app/api/orders/[id]/invoice/route.ts` - PDF invoice generation
- `src/emails/delivery-confirmation.tsx` - Delivery email template
- `src/app/api/admin/shipping/zones/route.ts` - Zone CRUD
- `src/app/api/admin/shipping/zones/[id]/route.ts` - Zone update/delete
- `src/app/api/admin/shipping/methods/route.ts` - Method creation
- `src/app/api/admin/shipping/methods/[id]/route.ts` - Method update/delete

**Files Modified:**
- `src/app/api/admin/orders/[id]/status/route.ts` - Email notifications on SHIPPED/DELIVERED
- `src/app/admin/shipping/page.tsx` - Interactive zone/method management

### E-Commerce Polish & Integration
**Status:** Implemented
**Priority:** High
**Started:** 2026-02-20

- [x] Checkout redirect URLs include locale prefix (Stripe success/cancel URLs)
- [x] Cart page coupon code UI (input, validation, applied state, discount display)
- [x] Locale passed from frontend to checkout API
- [x] Checkout loading state with spinner
- [x] sitemap.ts with hreflang alternates for all locales (products, collections, blog)
- [x] robots.ts (disallow /admin, /api, /studio, /account)
- [x] Locale-aware 404 not-found page (translated)
- [x] WishlistButton component on product detail (heart toggle, auth-aware)
- [x] ProductDetail translated (sale badge, options, materials, dimensions, care, add to cart)
- [x] ProductCard translated (sale badge, sold out)
- [x] Checkout success page translated (order summary, totals, confirmation email)
- [x] Cart recovery page translated (loading, error states, browse products)
- [x] Rate limiting on /api/auth/register (5 req/5min), /api/coupons/validate (10 req/min), /api/checkout (10 req/min)
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy)

**Files Created:**
- `src/app/sitemap.ts` - Dynamic sitemap with hreflang
- `src/app/robots.ts` - Robots configuration
- `src/app/[locale]/not-found.tsx` - Locale-aware 404
- `src/components/product/WishlistButton.tsx` - Wishlist toggle button
- `src/lib/rate-limit.ts` - In-memory rate limiter

**Files Modified:**
- `src/app/api/checkout/route.ts` - Locale redirects + rate limiting
- `src/app/[locale]/cart/page.tsx` - Coupon UI + translations
- `src/app/[locale]/cart/recover/[token]/page.tsx` - Translated
- `src/app/[locale]/checkout/success/page.tsx` - Translated
- `src/components/product/ProductDetail.tsx` - Translations + WishlistButton
- `src/components/product/ProductCard.tsx` - Translations
- `src/app/api/auth/register/route.ts` - Rate limiting
- `src/app/api/coupons/validate/route.ts` - Rate limiting
- `next.config.ts` - Security headers
- `messages/en.json`, `messages/es.json`, `messages/uk.json` - New translation keys

### Complete i18n Translations (Phase 5 Polish)
**Status:** Complete
**Priority:** High
**Completed:** 2026-02-20

- [x] Products page translated (title, sort options, filter labels, piece count, empty state)
- [x] CartDrawer component translated (title, close, empty, remove, subtotal, checkout)
- [x] Collections listing page translated (title, subtitle, piece count)
- [x] Collection detail page translated (breadcrumbs, piece count, empty state)
- [x] Blog listing page translated (title, subtitle, empty state)
- [x] Blog detail page translated (back link, author byline)
- [x] Account dashboard translated (welcome, stats, recent orders, status labels)
- [x] Account login page translated (sign in, subtitle, Google button, error messages)
- [x] Account register page translated (form labels, validation errors, sign-in link)
- [x] Account orders page translated (status badges, qty, total, tracking)
- [x] Account addresses page translated (form labels, buttons, default badge, empty state)
- [x] Account wishlist page translated (count, empty state, out of stock)
- [x] About page translated (35+ keys: artist bios, values, workshop, creative process, CTA)
- [x] Shipping page translated (25+ keys: zones table, tracking, returns, customs)
- [x] Size Guide page translated (25+ keys: ring/bracelet/necklace tables, size names, instructions)
- [x] ICU plural format used correctly (Ukrainian 3 forms, English/Spanish 2 forms)
- [x] TypeScript build passes clean

### SEO Metadata on All Pages
**Status:** Complete
**Priority:** High
**Completed:** 2026-02-20

- [x] Homepage generateMetadata (Home.heroTitle / heroSubtitleShort)
- [x] Products listing generateMetadata (Products.title / metaDescription)
- [x] Collections listing generateMetadata (Collections.title / subtitle)
- [x] Blog listing generateMetadata (Blog.title / subtitle)
- [x] About page generateMetadata (About.title / metaDescription)
- [x] Contact page generateMetadata (Contact.title / subtitle)
- [x] Shipping page generateMetadata (Shipping.title / subtitle)
- [x] Size Guide page generateMetadata (SizeGuide.title / subtitle)
- [x] Cart layout generateMetadata (Cart.title / metaDescription) — via layout.tsx for client component
- [x] Checkout success generateMetadata (Checkout.success) — converted from static metadata
- [x] Account dashboard generateMetadata (Account.title)
- [x] Account orders generateMetadata (Account.orderHistory)
- [x] Account wishlist generateMetadata (Account.wishlist)
- [x] Account login layout generateMetadata (Account.signIn)
- [x] Account register layout generateMetadata (Account.register)
- [x] Account addresses layout generateMetadata (Account.savedAddresses)
- [x] Product detail page — already had generateMetadata
- [x] Collection detail page — already had generateMetadata
- [x] Blog detail page — already had generateMetadata
- [x] All metadata is localized via getTranslations()

### Monitoring & Analytics (Phase 7 Polish)
**Status:** Complete
**Priority:** High
**Completed:** 2026-02-20

- [x] Sentry error tracking (@sentry/nextjs)
  - Client, server, and edge config files
  - instrumentation.ts with onRequestError hook
  - Global error boundary (global-error.tsx) captures to Sentry
  - App error boundary (error.tsx) captures to Sentry
  - withSentryConfig wrapper in next.config.ts
  - Source map upload support via SENTRY_AUTH_TOKEN
- [x] Google Analytics 4 integration
  - GoogleAnalytics component with next/script (afterInteractive)
  - Analytics helper library (trackEvent, trackAddToCart, trackBeginCheckout, trackPurchase, trackViewItem)
  - Cart store fires add_to_cart on item add
  - Cart page fires begin_checkout on checkout click
  - Checkout success page fires purchase event via PurchaseTracker component
  - Env var: NEXT_PUBLIC_GA_MEASUREMENT_ID
- [x] Performance optimizations
  - Added sizes prop to 7 Image components (hero, collections, artist portrait, about images)
  - Dynamic import for AnalyticsCharts (recharts) — no SSR, skeleton loader
  - Dynamic import for AIDescriptionGenerator — no SSR, skeleton loader
- [x] Open Graph & Twitter meta tags enhanced
  - Root layout: OG images (1200x630), alternateLocale (es_ES, uk_UA), language alternates
  - Twitter card with image
  - Homepage: localized OG title/description with image
  - Product detail: already had OG with product images

**Files Created:**
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- `instrumentation.ts`
- `src/app/global-error.tsx`
- `src/components/GoogleAnalytics.tsx`
- `src/components/PurchaseTracker.tsx`
- `src/lib/analytics.ts`

**Files Modified:**
- `next.config.ts` — withSentryConfig wrapper
- `src/app/layout.tsx` — GoogleAnalytics, enhanced OG/Twitter/alternates metadata
- `src/app/error.tsx` — Sentry.captureException
- `src/lib/store/cart.ts` — trackAddToCart on addItem
- `src/app/[locale]/cart/page.tsx` — trackBeginCheckout
- `src/app/[locale]/checkout/success/page.tsx` — PurchaseTracker
- `src/app/[locale]/page.tsx` — sizes props, enhanced OG metadata
- `src/app/[locale]/about/page.tsx` — sizes props
- `src/app/admin/analytics/page.tsx` — dynamic import AnalyticsCharts
- `src/app/admin/products/page.tsx` — dynamic import AIDescriptionGenerator
- `.env.example` — SENTRY_*, NEXT_PUBLIC_GA_MEASUREMENT_ID

### Storefront Polish & UX (Audit Tasks #37-#44)
**Status:** Complete
**Priority:** High
**Completed:** 2026-02-20

- [x] Contact form submission (ContactForm component → /api/contact → Resend email)
- [x] Newsletter signup (NewsletterForm light/dark variants, /api/newsletter, Prisma model)
- [x] Sanity webhook fix (upsert instead of create-only, variant tracking, delete handling)
- [x] Shipping selection UI on cart page (country dropdown, method radio buttons, rate calculation)
- [x] Product search dialog (Cmd+K shortcut, debounced, Sanity + mock fallback, thumbnails)
- [x] Order detail page (/account/orders/[id] with items, totals, tracking, address)
- [x] Address edit API (PATCH /api/account/addresses with ownership verification)
- [x] Toast notifications (Radix Toast, success/error/info variants, context provider)
- [x] Loading skeletons (products, collections, blog routes)
- [x] "Add to Cart" toast feedback in ProductDetail
- [x] Site URL fix (blossomjewelleryart.com → blossomjewellery.art)
- [x] Checkout discount bug fix (removed lineItems.pop() hack, direct Stripe coupon)
- [x] "Related Products" heading translated (extracted RelatedProducts server component)
- [x] Footer hardcoded English strings fixed (collections, about, contact → t() calls)
- [x] Instagram URL corrected across contact page and footer
- [x] Email address corrected to hello@blossomjewellery.art

**Files Created:**
- `src/components/ContactForm.tsx` - Contact form with loading/success/error states
- `src/app/api/contact/route.ts` - Contact form API (Zod + Resend)
- `src/components/NewsletterForm.tsx` - Newsletter form (light/dark variants)
- `src/app/api/newsletter/route.ts` - Newsletter subscription API
- `src/components/SearchDialog.tsx` - Product search with Cmd+K
- `src/app/api/search/route.ts` - Product search API
- `src/app/[locale]/account/orders/[id]/page.tsx` - Order detail page
- `src/components/Toast.tsx` - Radix Toast notification system
- `src/app/[locale]/products/loading.tsx` - Products skeleton
- `src/app/[locale]/collections/loading.tsx` - Collections skeleton
- `src/app/[locale]/blog/loading.tsx` - Blog skeleton

**Files Modified:**
- `src/app/[locale]/contact/page.tsx` - Uses ContactForm component
- `src/app/[locale]/page.tsx` - Uses NewsletterForm
- `src/components/layout/Footer.tsx` - Uses NewsletterForm + translations
- `src/components/layout/Header.tsx` - Uses SearchDialog
- `src/app/api/sanity/webhook/route.ts` - Proper upsert + delete handling
- `src/app/api/shipping/calculate/route.ts` - Hardcoded fallback zones
- `src/app/[locale]/cart/page.tsx` - Shipping selection UI
- `src/app/api/account/addresses/route.ts` - Added PATCH method
- `src/app/[locale]/account/orders/page.tsx` - Added "View Details" links
- `src/app/[locale]/layout.tsx` - Added ToastProvider
- `src/components/product/ProductDetail.tsx` - Toast on add to cart
- `src/lib/env.ts` - Fixed URL
- `src/app/api/checkout/route.ts` - Fixed discount bug
- `src/app/[locale]/products/[slug]/page.tsx` - Translated related products
- `prisma/schema.prisma` - Added NewsletterSubscriber model
- `messages/en.json`, `messages/es.json`, `messages/uk.json` - 30+ new translation keys

### Production Readiness (Session 2026-02-21)
**Status:** Complete
**Priority:** Critical
**Completed:** 2026-02-21

- [x] Fix build errors — next/dynamic ssr:false in server components (AnalyticsCharts, AIDescriptionGenerator)
- [x] Health check endpoint (/api/health — status, uptime, DB connectivity)
- [x] Railway deployment config (railway.toml with standalone output, health check, restart policy)
- [x] Standalone output mode (next.config.ts output: "standalone" for minimal deploy bundle)
- [x] Admin error page (src/app/admin/error.tsx with Sentry capture)
- [x] Admin not-found page (src/app/admin/not-found.tsx)
- [x] Runtime environment variable validation (envOrWarn, envOrDefault — no more non-null assertions)
- [x] Debug screenshots removed from git tracking (24 PNG files untracked)
- [x] .gitignore updated (*.png excluded except public/, docs/, src/)
- [x] next-sitemap config fixed (wrong URL, missing /admin and /account exclusions)
- [x] Playwright test suite (15 smoke tests across 4 browsers: Chromium, Firefox, WebKit, Mobile Chrome)
- [x] Cross-browser testing — 60/60 tests pass (homepage, products, collections, about, contact, cart, shipping, search, health, i18n, APIs, navigation)

**Files Created:**
- `src/app/api/health/route.ts` - Health check endpoint
- `src/app/admin/error.tsx` - Admin error boundary with Sentry
- `src/app/admin/not-found.tsx` - Admin 404 page
- `src/app/admin/analytics/AnalyticsChartsLoader.tsx` - Client wrapper for dynamic import
- `src/app/admin/products/AIDescriptionGeneratorLoader.tsx` - Client wrapper for dynamic import
- `railway.toml` - Railway deployment configuration
- `playwright.config.ts` - Playwright test configuration
- `tests/smoke.spec.ts` - 15 smoke tests

**Files Modified:**
- `src/app/admin/analytics/page.tsx` - Use client wrapper for AnalyticsCharts
- `src/app/admin/products/page.tsx` - Use client wrapper for AIDescriptionGenerator
- `src/lib/env.ts` - envOrWarn/envOrDefault replacing non-null assertions
- `next.config.ts` - Added output: "standalone"
- `next-sitemap.config.js` - Fixed URL and exclusions
- `.gitignore` - Exclude *.png from root

### Launch Preparation (Phase 8)
**Status:** In Progress
**Priority:** Critical

- [ ] Domain DNS configuration
- [ ] Railway production deployment
- [ ] Stripe live mode
- [ ] Email domain verification (SPF, DKIM, DMARC)
- [x] Sentry error tracking configured
- [x] Google Analytics 4 configured
- [x] Security headers configured
- [x] Rate limiting on sensitive endpoints
- [x] SEO metadata on all storefront pages
- [x] Open Graph / Twitter Cards configured
- [x] Performance optimizations (dynamic imports, image sizes, standalone output)
- [x] Health check endpoint
- [x] Railway deployment config
- [x] Cross-browser testing (60/60 Playwright tests pass)
- [x] Production build passes clean (zero errors)
- [ ] Final QA with Olha

---

## Project Integration

### Register in CodeLabs Hub
**Status:** Complete
**Priority:** Low
**Completed:** 2026-02-12

Features:
- [x] Create idea in CodeLabs Hub Ideas API
- [x] Add project description and analysis (10 sections populated)
- [ ] Share with Olha for visibility

**Details:**
- Hub Idea ID: `4e8c25f9-984d-476d-ba23-7eba47da88ff`
- Title: "Blossom - Joyeria Artesanal Botanica"
- Status: analyzed (score: 82/100)
- All 10 sections populated with content from research docs
- Accessible at: hub.codelabs.studio (Ideas section)
- Method: Direct database insert via psql to Neon PostgreSQL
