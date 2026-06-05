# Role Empathy Analysis & UX Validation

**Project**: Blossom by Olha — Artisan Polymer Clay Jewellery E-Commerce
**Date**: 2026-03-11
**Analyst**: Claude Opus 4.6

---

## Table of Contents
1. [Role Empathy Analysis](#1-role-empathy-analysis)
2. [UX Validation per Role](#2-ux-validation-per-role)
3. [Flow Analysis](#3-flow-analysis)
4. [Critical UX Gaps (Ranked)](#4-critical-ux-gaps-ranked)
5. [Launch Readiness Recommendations](#5-launch-readiness-recommendations)

---

## 1. Role Empathy Analysis

### VISITOR (Anonymous)

**Persona**: Maria, 28, scrolling Instagram, sees a beautiful earring photo linked to blossombyolha.com. On mobile. Short attention span, emotionally driven purchasing.

**Primary Goals**:
- Discover products visually — wants to *feel* the brand, not read specs
- Understand what makes this jewellery special (handmade, artisan, polymer clay)
- Decide quickly: is this for me? Is it worth the price?
- Browse collections for gift ideas or self-purchase

**Fears**:
- Is this legit? Will my payment be secure?
- How long will shipping take? Can I return it?
- Are these just cheap plastic or actually quality pieces?

**UX Needs**:
- Fast loading with gorgeous imagery (visual-first e-commerce)
- Clear value proposition above the fold
- Transparent pricing with no surprises at checkout
- Easy navigation: collections, categories, search
- Trust signals: secure payment, return policy, handmade guarantee
- Mobile-first: thumb-friendly nav, fast images, smooth scrolling

**Pages Accessed**: Homepage, Products, Collections, Product Detail, About, Contact, Cart, Shipping, Size Guide, Privacy, Terms, Blog

---

### CUSTOMER (Registered)

**Persona**: Elena, 34, bought earrings last month, loved them. Wants to browse more, maybe buy a matching set for her sister's birthday. Also wants to check order tracking.

**Primary Goals**:
- Re-purchase or gift: browse new items, save favorites
- Track existing orders: where is my package?
- Manage addresses for faster checkout
- Use coupons/offers received via email

**Fears**:
- Will I remember my login? (Google OAuth helps)
- What if my order is lost?
- Can I easily find what I bought before?

**UX Needs**:
- Simple login (Google OAuth + email/password)
- Dashboard showing orders, addresses, wishlist at a glance
- Order detail with status and tracking
- Wishlist for "save for later" browsing
- Saved addresses for repeat purchases
- Coupon input during checkout

**Pages Accessed**: All VISITOR pages + Login, Register, Account Dashboard, Orders, Order Detail, Addresses, Wishlist

---

### STORE_OWNER (Olha)

**Persona**: Olha, early 40s, Ukrainian artisan living in Spain. Makes polymer clay jewellery by hand. NOT technical — needs the admin panel to be simple and visual. Her daily workflow: check orders, pack items, update shipping, occasionally add products via Sanity Studio.

**Primary Goals**:
- See today's orders immediately on login
- Fulfill orders: print packing slip, enter tracking number, mark shipped
- Track revenue and see what's selling
- Manage coupons and offers for promotions
- Monitor inventory levels

**Fears**:
- Missing an order (customer complaint)
- Making a mistake in fulfillment (wrong address, wrong item)
- Not understanding a technical interface
- Running out of stock without knowing

**UX Needs**:
- Dashboard: today's orders + revenue front and center
- Clear order fulfillment workflow
- Low stock alerts visible on dashboard
- Ukrainian labels in sidebar (already implemented!)
- Quick links to common actions
- Mobile-friendly admin (she might check from her phone)

**Pages Accessed**: Admin Dashboard, Orders, Order Detail, Fulfill Order, Products, Inventory, Customers, Coupons, Offers, Shipping Zones, Marketing, AI Studio, Analytics, Sanity Studio (CMS)

---

### ADMIN (Technical — Jose)

**Persona**: Jose, the developer. Needs to ensure system health, manage users, debug issues, and configure technical aspects.

**Primary Goals**:
- System monitoring and health checks
- User management (role changes, account issues)
- Technical configuration (shipping zones, email templates)
- Analytics deep-dive

**Fears**:
- Security breach, exposed credentials
- Database issues, failed payments
- Deployment problems

**UX Needs**:
- All STORE_OWNER capabilities plus system-level views
- Ability to see raw data when debugging

**Pages Accessed**: All admin pages (identical to STORE_OWNER currently)

---

## 2. UX Validation per Role

### VISITOR UX Validation

#### What Works Well

| Area | Assessment | Notes |
|------|-----------|-------|
| **Homepage hero** | Strong | Split 50/50 layout is editorial and premium. "Finest jewellery, inspired by our life" is evocative. Shop Now CTA is clear. |
| **Visual design** | Excellent | Cream/navy palette feels luxurious for artisan jewellery. Typography hierarchy is strong (heading + body fonts). |
| **Featured products** | Good | 4-column grid with prices visible. Hover zoom effect. |
| **Collections showcase** | Good | Giant watermark typography adds editorial feel. 3-col image grid with hover overlays. |
| **Artist section** | Very good | Personal touch — Olha's portrait, her story. Key differentiator for handmade brand. |
| **Newsletter** | Present | Simple email capture at bottom of homepage. |
| **Product listing** | Good | Collection/category filters, sort options (price, name), piece count shown. |
| **Product detail** | Very good | Image gallery with thumbnails, variant selector, quantity control, wishlist button, trust badges (secure payment, handmade, free shipping, returns), materials/dimensions/care, contextual size guide link. |
| **Cart** | Comprehensive | Coupon input, country-based shipping calculator with method selection, free shipping threshold notification, clear totals breakdown. |
| **Navigation** | Good | Centered logo, left/right nav split. Shop, About, Collections, Blog, Contact. Language switcher, search, account, cart. Mobile hamburger menu. |
| **i18n** | Complete | English, Spanish, Ukrainian — covers target markets. |
| **SEO** | Strong | generateMetadata on all pages, JSON-LD (LocalBusiness, Product, Breadcrumb), sitemap.ts, robots.ts. |
| **Trust signals** | Good | Secure payment, handmade badge, shipping info, return policy on product detail. |
| **Search** | Present | SearchDialog component in header. |
| **Empty states** | Good | Cart empty state has icon + CTA to continue shopping. |
| **Loading states** | Present | Loading skeletons, Loader2 spinners. |

#### What's Missing or Weak

| Issue | Severity | Description |
|-------|----------|-------------|
| **Homepage hero not i18n** | Medium | "finest jewellery, inspired by our life" and "Handcrafted Polymer Clay" are hardcoded English strings, not using `t()` translations. Same for "Selected works:", "Perfect Match for Every Occasion", "beautiful pieces. excellent quality.", "Discover", "Discover the set", "OUR STORE" button. |
| **Promo banner 2 has no image** | Low | The "Perfect Match" section shows a blue color block but no product image. Missed opportunity for visual selling. |
| **No "New Arrivals" section** | Low | Common e-commerce pattern for repeat visitors. Not critical for launch. |
| **No product reviews/ratings** | Medium | Social proof is important for artisan jewellery. Visitors want to know others loved it. Not a launch blocker but significant for conversion. |
| **Guest checkout unclear** | Medium | Cart goes straight to Stripe checkout. It's unclear if guests can check out without registering — this is actually good (Stripe handles it), but there's no messaging about it. |
| **No FAQ page** | Low | Shipping, returns, materials info scattered. A dedicated FAQ would help. |
| **Mobile hero image very faint** | Low | On mobile, the hero image is opacity-10 (barely visible). The text panel fills the whole width. Could show the image more prominently on mobile. |
| **Blog likely empty** | Medium | Blog page exists but depends on Sanity content. If empty at launch, it's a dead link in the nav. |

---

### CUSTOMER UX Validation

#### What Works Well

| Area | Assessment | Notes |
|------|-----------|-------|
| **Login** | Good | Google OAuth + email/password. Clean form, error handling, link to register. |
| **Registration** | Present | Separate register page with link from login. |
| **Account dashboard** | Good | Welcome message, stats cards (orders, addresses, wishlist counts), recent orders with status badges and amounts. |
| **Order history** | Good | Full list with status badges, items with images, tracking numbers, view detail links. |
| **Order detail** | Present | Customer-facing order detail page exists at `/account/orders/[id]`. |
| **Wishlist** | Good | Grid layout with product images, prices, stock status, remove button. Empty state with CTA. |
| **Addresses** | Good | CRUD operations, default address flag, grid layout, form validation. |
| **Checkout success** | Excellent | Order confirmation with items, totals, order number, confirmation email note. |

#### What's Missing or Weak

| Issue | Severity | Description |
|-------|----------|-------------|
| **No password reset** | CRITICAL | No "Forgot password" link on login page. No reset password flow exists anywhere in the codebase. Customers who forget their password are locked out permanently unless they used Google OAuth. |
| **No profile editing** | High | Account page shows stats but no way to edit name, email, or change password. |
| **Address editing missing** | Medium | Can add and delete addresses, but no EDIT function. Must delete and re-create to fix a typo. |
| **No "Add to Cart" from wishlist** | Medium | Wishlist shows products but no direct "Add to Cart" button. Must click through to product detail to purchase. |
| **Order history not filterable** | Low | No status filter on customer orders page (admin has it, customer doesn't). |
| **No order cancellation** | Low | Customer can't request cancellation from their account. Must contact support. Acceptable for artisan business but should document it. |
| **Checkout doesn't pre-fill saved address** | Medium | Cart page has country selector and goes to Stripe, but saved addresses from the account aren't used to pre-fill. |
| **Date format hardcoded to en-GB** | Low | `toLocaleDateString('en-GB')` doesn't respect the user's selected locale (could be es/uk). |

---

### STORE_OWNER UX Validation

#### What Works Well

| Area | Assessment | Notes |
|------|-----------|-------|
| **Dashboard** | Good | Today's revenue + orders, month revenue with trend, pending orders count, recent orders with customer name + status + amount, low stock alerts. Exactly what Olha needs on login. |
| **Sidebar** | Excellent | Ukrainian translations next to English for key sections (Orders/Zamovlennya, Products/Tovary, etc.). Role badge shows "Propietaria" for STORE_OWNER. Links to CMS and storefront. |
| **Orders list** | Very good | Table with order number, customer, status, payment status, items, total, date. Status filter pills. Pagination. |
| **Order detail** | Excellent | Items with images, totals breakdown (subtotal, shipping, discount, tax, total), status timeline, customer info with profile link, shipping address, payment status, customer/internal notes, action buttons. |
| **Fulfillment page** | Very good | Packing slip with checkboxes per item (print-friendly), carrier dropdown (Correos, SEUR, MRW, DHL, etc. — Spain-relevant!), tracking number input, "Mark as Shipped" button, invoice download link. |
| **Products** | Good | Table view synced from Sanity with inventory overlay. Stock status badges (In Stock, Low Stock, Out of Stock). AI Images quick action per product. Link to Sanity Studio. |
| **Inventory** | Good | Full table: total, reserved, available, sold. Color-coded status. Inventory adjustment actions. |
| **Customers** | Good | Table: name, email, orders count, total spent, joined date. Pagination. Customer detail page exists. |
| **Marketing** | Good | Abandoned cart stats, recovery rate, recovery emails sent, active offers count. Quick actions: create flash sale, create coupon, manage offers/coupons. Recent abandoned carts list. |
| **Analytics** | Good | 30-day KPIs (revenue, orders, AOV, customers). Charts: daily revenue, status breakdown, top products. |
| **AI Studio** | Present | Description generator, image generation/enhancement, model profiles, gallery. Advanced feature for product photography. |
| **Shipping zones** | Present | Zone CRUD for managing shipping rates by region. |

#### What's Missing or Weak

| Issue | Severity | Description |
|-------|----------|-------------|
| **No mobile admin header/toggle** | High | AdminShell has `sidebarOpen` state but no visible hamburger button to toggle it on mobile. The sidebar is `lg:translate-x-0` but `-translate-x-full` on mobile, with no trigger button rendered in the main content area. Olha cannot access admin nav on her phone. |
| **No notification system** | Medium | New orders don't trigger any in-app notification. Olha has to manually check the dashboard. Email notifications for new orders would help. |
| **Inventory shows Sanity IDs, not product names** | High | The inventory page shows `item.sanityProductId` (a raw Sanity ID like `abc123xyz`) instead of the human-readable product name. Olha would have no idea which product is low on stock. |
| **No bulk order actions** | Low | Can't select multiple orders to print packing slips or update status in bulk. Fine for low volume at launch. |
| **No search in admin** | Medium | No way to search orders by customer name/email or search products. With few items at launch it's fine, but will matter as the catalog grows. |
| **Admin text is all English** | Medium | Sidebar has Ukrainian labels, but all page content, table headers, buttons, and stats cards are English-only. Olha's English may be limited. |
| **No settings page** | Low | No admin settings for store name, currency, tax rates, etc. Currently hardcoded. |
| **No export functionality** | Low | No CSV/PDF export for orders, customers, or analytics data. |
| **ADMIN and STORE_OWNER have zero differentiation** | Medium | Every page and API treats them identically. The role distinction exists in the schema but provides no functional difference. This is a design debt — not a launch blocker, but means there's no admin-only system config area. |

---

### ADMIN (Technical) UX Validation

#### What Works

- Same comprehensive panel as STORE_OWNER
- Role badge shows "Admin" in amber
- Can access all API routes

#### What's Missing

| Issue | Severity | Description |
|-------|----------|-------------|
| **No admin-only features** | Medium | ADMIN and STORE_OWNER are functionally identical. No user management page, no system health view, no role assignment UI, no email template management, no error log viewer. |
| **No user management UI** | Medium | Can't change user roles, reset passwords, or disable accounts from the admin panel. Must use database directly. |
| **No system health/status page** | Low | No view of Stripe webhook status, email delivery status, Sanity sync status, or error rates. |

---

## 3. Flow Analysis

### Flow 1: Visitor to Customer Conversion

```
Homepage → Browse Products → Product Detail → Add to Cart → Cart → Checkout (Stripe) → Success
                                    ↕                          ↕
                              Wishlist (requires login)   Apply Coupon
                                    ↓                    Select Shipping
                            Login/Register
```

**Assessment**: The happy path works well. Stripe handles the checkout form, so payment UX is best-in-class. The conversion funnel is:

1. **Discovery**: Homepage hero + featured products + collections = strong
2. **Engagement**: Product detail with images, variants, trust badges = strong
3. **Cart**: Coupon input, shipping calculator = strong
4. **Checkout**: Stripe-hosted = reliable
5. **Post-purchase**: Confirmation page with order details = good

**Friction points**:
- Wishlist requires login, which may bounce casual browsers (acceptable tradeoff)
- No "Buy Now" button to skip the cart (nice-to-have)
- Saved addresses don't carry through to Stripe checkout

---

### Flow 2: Order Lifecycle (Customer Perspective)

```
Purchase → Email Confirmation → Account > Orders (track status) → Shipped notification → Delivered
```

**Assessment**: The customer can see order status and tracking numbers. Email confirmation is sent via Resend. Shipped notification sends email with tracking info.

**Gap**: No delivery confirmation email. No "rate your purchase" post-delivery email.

---

### Flow 3: Order Lifecycle (Store Owner Perspective)

```
Dashboard (see new order) → Orders list (filter PENDING) → Order Detail (review items + address) → Fulfill Page (packing slip, tracking) → Mark Shipped → Customer notified
```

**Assessment**: This flow is well-designed and matches Olha's mental model of pack-and-ship. The packing slip with checkboxes is a practical touch. Carrier dropdown has Spain-relevant options.

**Gap**: No "batch fulfill" for busy days. The dashboard shows recent orders but no prominent "X orders need your attention" alert with a direct link to filtered PENDING view.

---

### Flow 4: Product Management (Store Owner)

```
Sanity Studio → Add/Edit Product → Admin > Products (view table) → AI Studio (generate descriptions/images)
```

**Assessment**: Product content lives in Sanity CMS, inventory/pricing overlays from Postgres. This dual architecture is sound but means Olha needs to understand two interfaces. The admin Products page links to Sanity Studio clearly.

**Gap**: No instruction or onboarding for Olha on how to use Sanity Studio. The link just opens it.

---

## 4. Critical UX Gaps (Ranked)

Ranked by **impact on launch success** (considering artisan e-commerce, low initial volume, and Olha as primary operator):

| # | Gap | Role Affected | Severity | Launch Blocker? |
|---|-----|--------------|----------|----------------|
| 1 | **No password reset flow** | CUSTOMER | CRITICAL | YES — customers who forget passwords are permanently locked out |
| 2 | **Mobile admin has no sidebar toggle** | STORE_OWNER | HIGH | YES — Olha likely checks orders from her phone |
| 3 | **Inventory shows Sanity IDs, not product names** | STORE_OWNER | HIGH | Partially — useless for Olha until product names are resolved |
| 4 | **Homepage hero text not translated** | VISITOR | MEDIUM | Not a blocker but looks broken for ES/UK visitors |
| 5 | **No profile editing (name, email, password)** | CUSTOMER | MEDIUM | Not blocker but poor experience |
| 6 | **Blog nav link may lead to empty page** | VISITOR | MEDIUM | Remove from nav if no content at launch |
| 7 | **No "Add to Cart" on wishlist** | CUSTOMER | MEDIUM | Friction in repurchase flow |
| 8 | **Address edit (not just delete+recreate)** | CUSTOMER | MEDIUM | Usability annoyance |
| 9 | **Admin content not localized for Olha** | STORE_OWNER | MEDIUM | Sidebar is bilingual, but page content is English-only |
| 10 | **No admin-only features vs store owner** | ADMIN | LOW | Not relevant for launch (same person) |
| 11 | **Date formats hardcoded to en-GB** | CUSTOMER | LOW | Minor inconsistency |
| 12 | **No product reviews** | VISITOR | LOW | Desirable but not expected for a new artisan brand |
| 13 | **No order export** | STORE_OWNER | LOW | Manual volume is low at launch |
| 14 | **No FAQ page** | VISITOR | LOW | Info exists on product pages and shipping page |

---

## 5. Launch Readiness Recommendations

### Must Fix Before Launch

1. **Password reset flow**: Add "Forgot password?" link on login page, implement email-based reset via Resend. Without this, any customer who forgets their password is a lost customer.

2. **Mobile admin sidebar toggle**: Add a hamburger/menu button in the admin main content area that triggers `setSidebarOpen(true)`. This is likely a one-line fix in `AdminShell.tsx`.

3. **Inventory product names**: Join Sanity product data in the inventory page to show actual product names instead of raw IDs. Or store the product name in the Inventory record at sync time.

### Should Fix Before Launch

4. **Translate homepage hardcoded strings**: Move "finest jewellery", "Selected works:", "Perfect Match for Every Occasion", etc. to translation files.

5. **Hide or populate blog**: If no blog content at launch, remove "Blog" from the header nav to avoid dead links.

6. **Profile editing**: At minimum, allow name changes and password changes from the account page.

### Nice to Have Post-Launch

7. Add "Add to Cart" button on wishlist items
8. Address editing
9. Product reviews system
10. Admin search
11. Order export (CSV)
12. Post-delivery review request email
13. FAQ page consolidating shipping/returns/materials info

---

*This document serves as the single source of truth for role empathy analysis. Update when new features are added or roles change.*
