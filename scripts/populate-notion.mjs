/**
 * Blossom Jewellery Art — Populate Notion databases (English)
 * Clears existing entries and repopulates in English
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')
const env = readFileSync(envPath, 'utf-8')
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim()

const API_KEY       = get('NOTION_API_KEY')
const ROADMAP_DB    = get('NOTION_ROADMAP_DB_ID')
const TASKS_DB      = get('NOTION_TASKS_DB_ID')
const PRODUCTS_DB   = get('NOTION_PRODUCTS_DB_ID')
const DECISIONS_DB  = get('NOTION_DECISIONS_DB_ID')

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

async function api(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${data.message}`)
  return data
}

async function addPage(databaseId, properties) {
  return api('/pages', 'POST', { parent: { database_id: databaseId }, properties })
}

const title = (t) => ({ title: [{ text: { content: t } }] })
const text  = (t) => ({ rich_text: [{ text: { content: t } }] })
const sel   = (n) => ({ select: { name: n } })
const date  = (d) => ({ date: { start: d } })
const num   = (n) => ({ number: n })
const check = (b) => ({ checkbox: b })

// ─── ROADMAP ─────────────────────────────────────────────────────────────────

const roadmapItems = [
  // PHASE 1 — Market Research
  {
    Name: title('Visit local jewelry stores (observe & photograph)'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟡 In Progress'),
    Priority: sel('Critical'),
    'Start Date': date('2026-02-21'),
    'End Date': date('2026-03-07'),
    Notes: text('Ola visits nearby jewelry stores and boutiques as a customer. Discreetly photograph products, note prices and presentation styles. No need to talk to anyone or explain anything.'),
  },
  {
    Name: title('Online competitor analysis (Etsy, Instagram)'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-12'),
    'End Date': date('2026-02-21'),
    Notes: text('Global market analysis complete. See docs/MARKET_ANALYSIS.md'),
  },
  {
    Name: title('Select 6-10 launch products from existing catalog'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-01'),
    'End Date': date('2026-03-15'),
    Notes: text('Ola picks the best pieces from her current catalog for the launch. Criteria: she loves them, they are reproducible, they represent the brand well, good price-quality ratio.'),
  },
  {
    Name: title('Pricing strategy & margin structure'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-12'),
    'End Date': date('2026-02-21'),
    Notes: text('Pricing structure defined. Retail = 3-5x production cost. Wholesale = 50% of retail. Range: €22-58 per piece. See docs/PRICING_STRATEGY.md'),
  },

  // PHASE 2 — Identity & Product
  {
    Name: title('Design packaging (card, pouch, box)'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-10'),
    'End Date': date('2026-03-31'),
    Notes: text('Ola designs the full packaging: jewelry card (brand name, care instructions, website), organza or kraft pouch, optional box for sets. Colors: soft rose + gold.'),
  },
  {
    Name: title('Produce 10-15 launch pieces (initial stock)'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-15'),
    'End Date': date('2026-04-15'),
    Notes: text('Ola produces the selected launch pieces. At least 2-3 units of each design for initial stock.'),
  },
  {
    Name: title('Product photography (phone + natural light setup)'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-01'),
    'End Date': date('2026-04-20'),
    Notes: text('Basic setup: white background (cardboard or fabric), natural side window light, phone on tripod. Per piece: 3-4 photos (front, close-up detail, on hand/neck, with packaging). Best time: morning soft light.'),
  },
  {
    Name: title('Website redesign: rose+gold palette, editorial style'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-21'),
    'End Date': date('2026-02-21'),
    Notes: text('Complete. Palette updated from sage green to blush rose + warm gold. Editorial bottom-anchored hero. Font 18px. Cleaner white background.'),
  },
  {
    Name: title('Upload real product photos to website'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-20'),
    'End Date': date('2026-05-01'),
    Notes: text('José uploads real photos and descriptions to Sanity CMS. Activate Stripe in live mode.'),
  },

  // PHASE 3 — Pre-launch
  {
    Name: title('Visit boutiques in Marbella (B2B pitch)'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-05-01'),
    'End Date': date('2026-05-20'),
    Notes: text('José visits premium boutiques in Marbella, Puerto Banús, Estepona. Bring printed lookbook + 2-3 physical samples. Wholesale price = 50% of retail.'),
  },
  {
    Name: title('Instagram: first 9 posts + bio setup'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('High'),
    'Start Date': date('2026-05-01'),
    'End Date': date('2026-05-15'),
    Notes: text('Ola prepares the initial Instagram grid. 9 visually consistent posts. Clear bio: who you are, what you make, where to buy. Link to website.'),
  },
  {
    Name: title('Domain setup & production deployment'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-25'),
    'End Date': date('2026-05-01'),
    Notes: text('Buy domain blossomjewellery.art, configure DNS, deploy on Railway, verify email (SPF/DKIM/DMARC), enable SSL, full store test.'),
  },

  // PHASE 4 — Launch
  {
    Name: title('Official launch'),
    Phase: sel('Phase 4 — Launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-05-20'),
    Notes: text('Publish website, announce on Instagram, send email to contacts. Monitor first orders together.'),
  },
]

// ─── TASKS ───────────────────────────────────────────────────────────────────

const tasks = [
  // OLA — PHASE 1
  {
    Name: title('Visit local jewelry stores — note prices & take photos'),
    Status: sel('🔄 In Progress'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    Notes: text('Go in as a customer. Discreetly photograph products (prices, presentation, style). No need to speak to anyone or explain anything. Notes to capture: type of jewelry, price, visible packaging, brand. Upload photos to the "Market Research" database here in Notion.'),
  },
  {
    Name: title('Create packaging inspiration board on Pinterest'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    Notes: text('Create a Pinterest board "Blossom Packaging" with jewelry packaging references you love. Focus on: boxes, pouches, jewelry cards, soft rose and gold color palette.'),
  },
  {
    Name: title('Choose 6-10 launch pieces from existing catalog'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-15'),
    Notes: text('From your full catalog, select the pieces to launch first. Criteria: (1) you love them, (2) you can reproduce them, (3) they represent the brand well. Add them to the "Products" database here in Notion.'),
  },
  {
    Name: title('Find photo style references you love (Instagram/Pinterest)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Medium'),
    Notes: text('Save 10-20 photos of handmade jewelry you love visually. These will define Blossom\'s photography style. Save them in a Pinterest board or share them in Notion.'),
  },

  // JOSÉ — PHASE 1
  {
    Name: title('Set up Notion workspace & databases'),
    Status: sel('✅ Done'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    Notes: text('Completed 2026-02-21. Blossom workspace created with 6 databases: Roadmap, Tasks, Products, Market Research, B2B Leads, Decisions Log.'),
  },
  {
    Name: title('Website redesign: rose + gold palette'),
    Status: sel('✅ Done'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    Notes: text('Completed 2026-02-21. Updated palette, editorial hero, 18px font, cleaner white background.'),
  },
  {
    Name: title('Research packaging suppliers in Spain/Europe'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Medium'),
    'Due Date': date('2026-03-15'),
    Notes: text('Find suppliers for: jewelry boxes, organza pouches, presentation cards, tissue paper. Requirements: low minimum order, reasonable price, decent quality. References: Alibaba, Packly, Made in Design.'),
  },
  {
    Name: title('Build list of Marbella boutiques to visit for B2B'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    'Due Date': date('2026-04-01'),
    Notes: text('Search Google Maps for boutiques and jewelry stores in: Marbella centre, Puerto Banús, Golden Mile, Estepona, Benahavís. Add them to the "B2B Leads" database.'),
  },
  {
    Name: title('Invite Ola to Blossom Notion workspace'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-02-28'),
    Notes: text('Settings → People → Invite → Ola\'s email. Give her access to all databases so she can update tasks, add market research, and track products.'),
  },

  // OLA — PHASE 2
  {
    Name: title('Design jewelry card (brand, care instructions, website)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-31'),
    Notes: text('Small card to include with every piece. Content: piece name (optional), care instructions (avoid water, perfume, sweat), website blossomjewellery.art, Instagram @blossomjewelleryart. Design: soft rose + gold, elegant and minimal.'),
  },
  {
    Name: title('Design pouch or box for packaging'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-31'),
    Notes: text('Choose between organza pouch, kraft bag, or small box. Something that can be personalized with a sticker or stamp. Think about the unboxing moment: what does someone feel when they receive it?'),
  },
  {
    Name: title('Produce launch pieces (initial stock)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-04-15'),
    Notes: text('Produce 2-3 units of each selected piece. Total: ~25-30 pieces for launch. Prioritize the ones you love most and those that photograph well.'),
  },
  {
    Name: title('Photograph products (home setup with phone)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-04-20'),
    Notes: text('Setup: white background (cardboard or fabric), natural side window light, phone on tripod. Per piece: 3-4 shots (front, close detail, on hand/neck, with packaging). Best time: morning with soft natural light.'),
  },

  // JOSÉ — PHASE 2
  {
    Name: title('Upload real product photos to Sanity CMS'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('Once Ola has the photos ready, upload them to Sanity CMS and update product pages with real photos, final prices, and descriptions.'),
  },
  {
    Name: title('Activate Stripe live mode (real payments)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('Create Stripe account, verify identity, add bank account. Switch keys from test to live in environment config. Run a real €1 test order.'),
  },

  // PHASE 3 — José
  {
    Name: title('Visit Marbella boutiques — B2B pitch'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-20'),
    Notes: text('Bring: printed lookbook (product photos + wholesale prices), 2-3 physical samples, business card. Pitch: "Handmade polymer clay jewelry, made in Europe, wholesale price €X". Log results in B2B Leads.'),
  },
  {
    Name: title('Set up domain + production deployment'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('1. Buy domain blossomjewellery.art\n2. Configure DNS\n3. Deploy on Railway with production env vars\n4. Verify email (SPF, DKIM, DMARC)\n5. Enable SSL\n6. Full store end-to-end test'),
  },

  // OLA — PHASE 3
  {
    Name: title('Set up Instagram bio + first 9 posts'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('High'),
    'Due Date': date('2026-05-15'),
    Notes: text('Bio: who you are, what you make, where to buy (website link). 9 first posts: mix of product alone, product being worn, making process, packaging. Visual consistency: light tones, neutral background.'),
  },

  // BOTH — PHASE 4
  {
    Name: title('Official launch: Instagram post + email announcement'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Both'),
    Phase: sel('Phase 4 — Launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-20'),
    Notes: text('Publish launch post on Instagram. Send email to contact list. Open the online store. Monitor first orders together.'),
  },
]

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

const products = [
  { name: 'Embroidered Circle Earrings', collection: 'Ukrainian Heritage', type: 'Earrings', retail: 28, wholesale: 14, cost: 6 },
  { name: 'Red Vyshyvanka Drop Earrings', collection: 'Ukrainian Heritage', type: 'Earrings', retail: 32, wholesale: 16, cost: 7 },
  { name: 'Heritage Statement Necklace', collection: 'Ukrainian Heritage', type: 'Necklace', retail: 55, wholesale: 28, cost: 12 },
  { name: 'Red Rose Stud Earrings', collection: 'Red Roses', type: 'Earrings', retail: 24, wholesale: 12, cost: 5 },
  { name: 'Red Rose Drop Earrings', collection: 'Red Roses', type: 'Earrings', retail: 29, wholesale: 15, cost: 6 },
  { name: 'Blush Rose Stud Earrings', collection: 'Pink Roses', type: 'Earrings', retail: 24, wholesale: 12, cost: 5 },
  { name: 'Pink Rose Necklace', collection: 'Pink Roses', type: 'Necklace', retail: 48, wholesale: 24, cost: 10 },
  { name: 'Yellow Rose Drop Earrings', collection: 'Yellow Roses', type: 'Earrings', retail: 26, wholesale: 13, cost: 5 },
  { name: 'Purple Orchid Earrings', collection: 'Orchid Dreams', type: 'Earrings', retail: 32, wholesale: 16, cost: 7 },
  { name: 'Orchid Statement Necklace', collection: 'Orchid Dreams', type: 'Necklace', retail: 58, wholesale: 29, cost: 13 },
  { name: 'Dark Bloom Earrings', collection: 'Dark Bloom', type: 'Earrings', retail: 35, wholesale: 18, cost: 8 },
  { name: 'Peony Mini Studs', collection: 'Peony Delicates', type: 'Earrings', retail: 22, wholesale: 11, cost: 4 },
  { name: 'Peony Drop Earrings', collection: 'Peony Delicates', type: 'Earrings', retail: 30, wholesale: 15, cost: 6 },
  { name: 'Garden Blossom Necklace', collection: 'Mediterranean Garden', type: 'Necklace', retail: 52, wholesale: 26, cost: 11 },
  { name: 'Mediterranean Hoop Earrings', collection: 'Mediterranean Garden', type: 'Earrings', retail: 34, wholesale: 17, cost: 7 },
  { name: 'Classic Clay Studs Set', collection: 'Peony Delicates', type: 'Set', retail: 45, wholesale: 23, cost: 10 },
]

// ─── DECISIONS ───────────────────────────────────────────────────────────────

const decisions = [
  {
    Decision: title('Platform: Next.js + Sanity CMS (not Shopify)'),
    Area: sel('Tech'),
    'Made By': sel('José'),
    Date: date('2026-02-12'),
    Rationale: text('Shopify charges 2-3% per sale + €29-79/month plan. Custom Next.js costs only hosting (~€20/month on Railway). More control, lower long-term cost.'),
  },
  {
    Decision: title('Retail pricing: 3-5x production cost'),
    Area: sel('Business'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Standard for the handmade market. Allows 50% wholesale margin without losing profitability. Range: €22-58 per piece depending on complexity.'),
  },
  {
    Decision: title('Wholesale model: 50% of retail price'),
    Area: sel('Business'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Industry standard for B2B jewelry. Gives boutiques a 100% markup (2x). If retail is €30, wholesale is €15.'),
  },
  {
    Decision: title('Brand palette: soft blush rose + warm gold (no sage green)'),
    Area: sel('Design'),
    'Made By': sel('Both'),
    Date: date('2026-02-21'),
    Rationale: text('Soft rose = feminine, premium, editorial. Warm gold = accessible luxury, artisanal feel. Removed sage green which felt too organic/natural and didn\'t match the premium positioning.'),
  },
  {
    Decision: title('Website languages: English, Spanish, Ukrainian'),
    Area: sel('Product'),
    'Made By': sel('Both'),
    Date: date('2026-02-15'),
    Rationale: text('English: international market and Costa del Sol tourists. Spanish: local market. Ukrainian: Ola\'s community and Eastern European diaspora in Western Europe.'),
  },
  {
    Decision: title('Main channel: Instagram + own website (not Etsy at launch)'),
    Area: sel('Marketing'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Etsy takes 6.5% fee + €0.20 per listing + currency conversion. Instagram for discovery, own website for conversion. Etsy as secondary channel once established.'),
  },
  {
    Decision: title('Notion as central collaboration tool'),
    Area: sel('Business'),
    'Made By': sel('José'),
    Date: date('2026-02-21'),
    Rationale: text('José is in Marbella, Ola is in another country. Notion lets us share roadmap, tasks, product catalog, and market research without constant calls. Integrated with the website via Notion API.'),
  },
]

// ─── Execute ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Clearing old entries...\n')

  const dbs = [
    { name: 'Roadmap', id: ROADMAP_DB },
    { name: 'Tasks', id: TASKS_DB },
    { name: 'Products', id: PRODUCTS_DB },
    { name: 'Decisions', id: DECISIONS_DB },
  ]

  for (const db of dbs) {
    const count = await clearDatabase(db.id)
    console.log(`   ✓ Cleared ${count} entries from ${db.name}`)
  }

  console.log('\n🌸 Populating in English...\n')

  console.log(`🗺️  Adding ${roadmapItems.length} roadmap items...`)
  for (const item of roadmapItems) { await addPage(ROADMAP_DB, item); process.stdout.write('.') }
  console.log(' ✓')

  console.log(`✅ Adding ${tasks.length} tasks...`)
  for (const task of tasks) { await addPage(TASKS_DB, task); process.stdout.write('.') }
  console.log(' ✓')

  console.log(`💍 Adding ${products.length} products...`)
  for (const p of products) {
    await addPage(PRODUCTS_DB, {
      Name: title(p.name),
      Collection: sel(p.collection),
      Type: sel(p.type),
      Status: sel('📸 Needs Photography'),
      'Retail Price (€)': num(p.retail),
      'Wholesale Price (€)': num(p.wholesale),
      'Cost to Make (€)': num(p.cost),
      'In Stock': check(false),
    })
    process.stdout.write('.')
  }
  console.log(' ✓')

  console.log(`📋 Adding ${decisions.length} decisions...`)
  for (const d of decisions) { await addPage(DECISIONS_DB, d); process.stdout.write('.') }
  console.log(' ✓')

  console.log('\n═══════════════════════════════════════════')
  console.log('✅ Done! All content is now in English.')
  console.log(`   Roadmap:   ${roadmapItems.length} items`)
  console.log(`   Tasks:     ${tasks.length} tasks`)
  console.log(`   Products:  ${products.length} products`)
  console.log(`   Decisions: ${decisions.length} decisions`)
  console.log('═══════════════════════════════════════════')
}

async function clearDatabase(dbId) {
  let cursor, count = 0
  do {
    const body = { page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const res = await api(`/databases/${dbId}/query`, 'POST', body)
    for (const page of res.results) {
      await api(`/pages/${page.id}`, 'PATCH', { archived: true })
      count++
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return count
}

main().catch(console.error)
