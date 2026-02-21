/**
 * Blossom Jewellery Art — Notion Workspace Setup
 * Creates all databases and pages for the project hub
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')

// Read API key from .env.local
const env = readFileSync(envPath, 'utf-8')
const API_KEY = env.match(/NOTION_API_KEY=(.+)/)?.[1]?.trim()

if (!API_KEY) {
  console.error('❌ NOTION_API_KEY not found in .env.local')
  process.exit(1)
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

async function notionRequest(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Notion API error (${res.status}): ${JSON.stringify(data)}`)
  }
  return data
}

async function createPage(parentId, title, emoji) {
  return notionRequest('/pages', 'POST', {
    parent: parentId ? { page_id: parentId } : { type: 'workspace', workspace: true },
    icon: { type: 'emoji', emoji },
    properties: {
      title: { title: [{ text: { content: title } }] },
    },
  })
}

async function createDatabase(parentId, title, emoji, properties) {
  return notionRequest('/databases', 'POST', {
    parent: { page_id: parentId },
    icon: { type: 'emoji', emoji },
    title: [{ type: 'text', text: { content: title } }],
    properties,
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Setting up Blossom Notion workspace...\n')

  // 1. Use existing hub page (created manually)
  const hubId = '30ee6fbd57f880dbb3fcffbd88831507'
  console.log(`📄 Using existing Hub page: ${hubId}\n`)

  // 2. ROADMAP database
  console.log('🗺️  Creating Roadmap database...')
  const roadmap = await createDatabase(hubId, 'Roadmap', '🗺️', {
    Name: { title: {} },
    Phase: {
      select: {
        options: [
          { name: 'Phase 1 — Market Research', color: 'blue' },
          { name: 'Phase 2 — Identity & Product', color: 'purple' },
          { name: 'Phase 3 — Pre-launch', color: 'orange' },
          { name: 'Phase 4 — Launch', color: 'green' },
        ],
      },
    },
    Status: {
      select: {
        options: [
          { name: '🔵 Planned', color: 'blue' },
          { name: '🟡 In Progress', color: 'yellow' },
          { name: '🟢 Complete', color: 'green' },
          { name: '⏸️ Paused', color: 'gray' },
        ],
      },
    },
    Priority: {
      select: {
        options: [
          { name: 'Critical', color: 'red' },
          { name: 'High', color: 'orange' },
          { name: 'Medium', color: 'yellow' },
          { name: 'Low', color: 'gray' },
        ],
      },
    },
    'Start Date': { date: {} },
    'End Date': { date: {} },
    Notes: { rich_text: {} },
  })
  console.log(`   ✓ Roadmap: ${roadmap.url}\n`)

  // 3. TASKS database
  console.log('✅ Creating Tasks database...')
  const tasks = await createDatabase(hubId, 'Tasks', '✅', {
    Name: { title: {} },
    Status: {
      select: {
        options: [
          { name: '⬜ Todo', color: 'gray' },
          { name: '🔄 In Progress', color: 'blue' },
          { name: '✅ Done', color: 'green' },
          { name: '🚫 Blocked', color: 'red' },
        ],
      },
    },
    Assigned: {
      select: {
        options: [
          { name: 'José', color: 'blue' },
          { name: 'Ola', color: 'pink' },
          { name: 'Both', color: 'purple' },
        ],
      },
    },
    Phase: {
      select: {
        options: [
          { name: 'Phase 1 — Market Research', color: 'blue' },
          { name: 'Phase 2 — Identity & Product', color: 'purple' },
          { name: 'Phase 3 — Pre-launch', color: 'orange' },
          { name: 'Phase 4 — Launch', color: 'green' },
        ],
      },
    },
    Priority: {
      select: {
        options: [
          { name: 'Critical', color: 'red' },
          { name: 'High', color: 'orange' },
          { name: 'Medium', color: 'yellow' },
          { name: 'Low', color: 'gray' },
        ],
      },
    },
    'Due Date': { date: {} },
    Notes: { rich_text: {} },
  })
  console.log(`   ✓ Tasks: ${tasks.url}\n`)

  // 4. PRODUCTS database
  console.log('💍 Creating Products database...')
  const products = await createDatabase(hubId, 'Products', '💍', {
    Name: { title: {} },
    Collection: {
      select: {
        options: [
          { name: 'Ukrainian Heritage', color: 'blue' },
          { name: 'Red Roses', color: 'red' },
          { name: 'Pink Roses', color: 'pink' },
          { name: 'Yellow Roses', color: 'yellow' },
          { name: 'Orchid Dreams', color: 'purple' },
          { name: 'Dark Bloom', color: 'gray' },
          { name: 'Peony Delicates', color: 'pink' },
          { name: 'Mediterranean Garden', color: 'green' },
        ],
      },
    },
    Type: {
      select: {
        options: [
          { name: 'Earrings', color: 'pink' },
          { name: 'Necklace', color: 'purple' },
          { name: 'Ring', color: 'blue' },
          { name: 'Bracelet', color: 'orange' },
          { name: 'Set', color: 'green' },
        ],
      },
    },
    Status: {
      select: {
        options: [
          { name: '💡 Idea', color: 'gray' },
          { name: '🔨 In Production', color: 'yellow' },
          { name: '📸 Needs Photography', color: 'orange' },
          { name: '✅ Ready to List', color: 'green' },
          { name: '🟢 Live', color: 'green' },
          { name: '❌ Discontinued', color: 'red' },
        ],
      },
    },
    'Retail Price (€)': { number: { format: 'euro' } },
    'Wholesale Price (€)': { number: { format: 'euro' } },
    'Cost to Make (€)': { number: { format: 'euro' } },
    'In Stock': { checkbox: {} },
    Notes: { rich_text: {} },
  })
  console.log(`   ✓ Products: ${products.url}\n`)

  // 5. MARKET RESEARCH database
  console.log('🔍 Creating Market Research database...')
  const market = await createDatabase(hubId, 'Market Research — Stores', '🔍', {
    Name: { title: {} },
    City: { rich_text: {} },
    Type: {
      select: {
        options: [
          { name: 'Joyería', color: 'yellow' },
          { name: 'Boutique', color: 'pink' },
          { name: 'Tienda de regalos', color: 'blue' },
          { name: 'Mercado', color: 'green' },
          { name: 'Online', color: 'purple' },
        ],
      },
    },
    'Price Range': {
      select: {
        options: [
          { name: '€ (económico)', color: 'gray' },
          { name: '€€ (medio)', color: 'yellow' },
          { name: '€€€ (premium)', color: 'orange' },
        ],
      },
    },
    'Sells Clay Jewelry': {
      select: {
        options: [
          { name: 'Yes', color: 'red' },
          { name: 'No', color: 'green' },
          { name: 'Similar', color: 'yellow' },
        ],
      },
    },
    'Avg Price Observed (€)': { number: { format: 'euro' } },
    Notes: { rich_text: {} },
    'Visited Date': { date: {} },
    'Visited By': {
      select: {
        options: [
          { name: 'José', color: 'blue' },
          { name: 'Ola', color: 'pink' },
        ],
      },
    },
  })
  console.log(`   ✓ Market Research: ${market.url}\n`)

  // 6. B2B LEADS database
  console.log('🤝 Creating B2B Leads database...')
  const b2b = await createDatabase(hubId, 'B2B Leads — Boutiques', '🤝', {
    'Store Name': { title: {} },
    City: { rich_text: {} },
    Contact: { rich_text: {} },
    Status: {
      select: {
        options: [
          { name: '🆕 New', color: 'gray' },
          { name: '📞 Contacted', color: 'blue' },
          { name: '🤔 Interested', color: 'yellow' },
          { name: '✅ Order Placed', color: 'green' },
          { name: '❌ Not Interested', color: 'red' },
          { name: '🔄 Follow Up', color: 'orange' },
        ],
      },
    },
    'First Contact Date': { date: {} },
    'Follow Up Date': { date: {} },
    Notes: { rich_text: {} },
  })
  console.log(`   ✓ B2B Leads: ${b2b.url}\n`)

  // 7. DECISIONS LOG
  console.log('📋 Creating Decisions Log database...')
  const decisions = await createDatabase(hubId, 'Decisions Log', '📋', {
    Decision: { title: {} },
    Area: {
      select: {
        options: [
          { name: 'Product', color: 'pink' },
          { name: 'Design', color: 'purple' },
          { name: 'Business', color: 'blue' },
          { name: 'Tech', color: 'gray' },
          { name: 'Marketing', color: 'orange' },
        ],
      },
    },
    'Made By': {
      select: {
        options: [
          { name: 'José', color: 'blue' },
          { name: 'Ola', color: 'pink' },
          { name: 'Both', color: 'purple' },
        ],
      },
    },
    Date: { date: {} },
    Rationale: { rich_text: {} },
  })
  console.log(`   ✓ Decisions Log: ${decisions.url}\n`)

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════')
  console.log('✅ Notion workspace setup complete!\n')
  console.log('📋 Database IDs (add to .env.local):')
  console.log(`NOTION_HUB_PAGE_ID=${hubId}`)
  console.log(`NOTION_ROADMAP_DB_ID=${roadmap.id}`)
  console.log(`NOTION_TASKS_DB_ID=${tasks.id}`)
  console.log(`NOTION_PRODUCTS_DB_ID=${products.id}`)
  console.log(`NOTION_MARKET_DB_ID=${market.id}`)
  console.log(`NOTION_B2B_DB_ID=${b2b.id}`)
  console.log(`NOTION_DECISIONS_DB_ID=${decisions.id}`)
  console.log('\n🔗 Hub URL: https://www.notion.so/Blossom-Project-Hub-30ee6fbd57f880dbb3fcffbd88831507')
  console.log('═══════════════════════════════════════════')
}

main().catch(console.error)
