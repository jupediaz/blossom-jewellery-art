/**
 * Create 5 image galleries in Notion for Ola
 * Update task descriptions to reference them (English only)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')
const env = readFileSync(envPath, 'utf-8')
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim()

const API_KEY   = get('NOTION_API_KEY')
const TASKS_DB  = get('NOTION_TASKS_DB_ID')
const HUB_PAGE  = get('NOTION_HUB_PAGE_ID')

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

const title = (t) => ({ title: [{ text: { content: t } }] })
const text  = (t) => ({ rich_text: [{ text: { content: t } }] })
const sel   = (n) => ({ select: { name: n } })
const date  = (d) => ({ date: { start: d } })
const url   = (u) => ({ url: u })

// ─── Gallery database schema (shared structure) ───────────────────────────────

function gallerySchema(emoji, name, extraProperties = {}) {
  return {
    parent: { page_id: HUB_PAGE },
    icon: { type: 'emoji', emoji },
    title: [{ type: 'text', text: { content: name } }],
    properties: {
      Name: { title: {} },
      Image: { files: {} },
      Notes: { rich_text: {} },
      ...extraProperties,
    },
  }
}

// ─── Archive old Inspiration Board (clean up) ─────────────────────────────────

async function archiveOldInspirationDB() {
  // Query the hub page for child databases named "Inspiration Board"
  try {
    const res = await api(`/blocks/${HUB_PAGE}/children`)
    for (const block of res.results) {
      if (block.type === 'child_database' &&
          block.child_database?.title === 'Inspiration Board') {
        // We can't delete databases via API, just note it
        console.log('   Note: Please manually delete "Inspiration Board" from Notion if it appears.')
      }
    }
  } catch { /* ignore */ }
}

// ─── Archive old Ola tasks ────────────────────────────────────────────────────

async function archiveOlaTasks() {
  let cursor, count = 0
  do {
    const body = { page_size: 100, filter: { property: 'Assigned', select: { equals: 'Ola' } } }
    if (cursor) body.start_cursor = cursor
    const res = await api(`/databases/${TASKS_DB}/query`, 'POST', body)
    for (const page of res.results) {
      await api(`/pages/${page.id}`, 'PATCH', { archived: true })
      count++
    }
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return count
}

async function addPage(dbId, props) {
  return api('/pages', 'POST', { parent: { database_id: dbId }, properties: props })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Creating 5 image galleries for Ola...\n')

  // 1. Packaging Gallery
  console.log('📦 Creating Packaging Gallery...')
  const packaging = await api('/databases', 'POST', gallerySchema('📦', 'Packaging Inspiration', {
    Type: {
      select: {
        options: [
          { name: 'Box', color: 'pink' },
          { name: 'Pouch / Bag', color: 'purple' },
          { name: 'Jewelry Card', color: 'yellow' },
          { name: 'Tissue Paper', color: 'blue' },
          { name: 'Other', color: 'gray' },
        ],
      },
    },
  }))
  console.log(`   ✓ ${packaging.url}`)

  // 2. Websites & Brands Gallery
  console.log('🌐 Creating Websites & Brands Gallery...')
  const websites = await api('/databases', 'POST', gallerySchema('🌐', 'Websites & Brands I Like', {
    URL: { url: {} },
    'What I like about it': { rich_text: {} },
  }))
  console.log(`   ✓ ${websites.url}`)

  // 3. Jewelry Inspiration Gallery
  console.log('💍 Creating Jewelry Inspiration Gallery...')
  const jewelry = await api('/databases', 'POST', gallerySchema('💍', 'Jewelry Inspiration', {
    'What I like': { rich_text: {} },
  }))
  console.log(`   ✓ ${jewelry.url}`)

  // 4. Model Photos — Ola
  console.log('🤳 Creating Model Photos gallery...')
  const modelPhotos = await api('/databases', 'POST', gallerySchema('🤳', 'My Photos — Model Shots', {
    Notes: { rich_text: {} },
  }))
  console.log(`   ✓ ${modelPhotos.url}`)

  // 5. My Products gallery
  console.log('💎 Creating My Products gallery...')
  const myProducts = await api('/databases', 'POST', gallerySchema('💎', 'My Products — Photos', {
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
          { name: 'Other', color: 'default' },
        ],
      },
    },
    'Ready for website': { checkbox: {} },
  }))
  console.log(`   ✓ ${myProducts.url}`)

  console.log()

  // ─── Seed placeholder entries so Ola sees what to do ───────────────────────

  console.log('🌱 Adding example entries...')

  await addPage(packaging.id, {
    Name: title('Example: Add a screenshot of packaging you love here'),
    Notes: text('Upload an image in the "Image" field. Add a note about what you like: color, material, shape, feel.'),
  })

  await addPage(websites.id, {
    Name: title('Example: Wolf & Moon'),
    URL: url('https://www.wolfandmoon.com'),
    'What I like about it': text('Clean white background, simple typography, editorial product photos. Good reference for style.'),
  })

  await addPage(websites.id, {
    Name: title('Example: Erstwhile Jewelry'),
    URL: url('https://www.erstwhilejewelry.com'),
    'What I like about it': text('Warm photography, storytelling, premium feel without being cold.'),
  })

  await addPage(jewelry.id, {
    Name: title('Example: Add a jewelry photo you find beautiful here'),
    Notes: text('It can be from Instagram, Pinterest, anywhere. Upload the screenshot and add a note about what catches your eye.'),
  })

  await addPage(modelPhotos.id, {
    Name: title('Example: Add your best personal photos here'),
    Notes: text('Photos of you that you like — wearing jewelry or not. Jose will use these as a base for the AI product photography tool.'),
  })

  await addPage(myProducts.id, {
    Name: title('Example: Add photos of your existing pieces here'),
    Notes: text('Phone photo is fine. Any background. One piece per entry. José will process them with AI into professional product shots.'),
  })

  console.log('   ✓ Starter entries added\n')

  // ─── Archive old tasks and replace with new ──────────────────────────────

  console.log('🗑️  Archiving old Ola tasks...')
  const archived = await archiveOlaTasks()
  console.log(`   ✓ Archived ${archived}\n`)

  console.log('✅ Creating new Ola tasks...')

  const newTasks = [
    {
      Name: title('📸 Upload photos of your existing pieces to "My Products — Photos"'),
      Status: sel('🔄 In Progress'),
      Assigned: sel('Ola'),
      Phase: sel('Phase 1 — Market Research'),
      Priority: sel('Critical'),
      'Due Date': date('2026-03-01'),
      Notes: text(
        'WHY: José needs your product photos to set up the website and build the AI tool that will turn them into professional shots.\n\n' +
        'WHERE: Open "My Products — Photos" in Notion. Create one entry per piece. Upload the photo in the "Image" field.\n\n' +
        'HOW TO TAKE THE PHOTOS: Phone is perfect. Place the piece near a window (natural light). Any background works. One clear photo from the front per piece.\n\n' +
        'GOAL: Upload at least 10 pieces.\n\n' +
        'TIME NEEDED: About 30 minutes.'
      ),
    },
    {
      Name: title('🛍️ Visit 2-3 jewelry stores near you — observe, photograph, note prices'),
      Status: sel('⬜ Todo'),
      Assigned: sel('Ola'),
      Phase: sel('Phase 1 — Market Research'),
      Priority: sel('Critical'),
      'Due Date': date('2026-03-07'),
      Notes: text(
        'WHY: We need to know what is selling near you, at what prices, and how it is packaged. This tells us how to price your pieces and what the competition looks like.\n\n' +
        'HOW: Go in as a normal customer. You do NOT need to explain anything or say you make jewelry. Just browse and take photos of:\n' +
        '  - The pieces on display (type, style)\n' +
        '  - The price tags\n' +
        '  - The packaging if visible\n\n' +
        'WHERE TO UPLOAD: Add the photos to the "Market Research" database in Notion. Or send them to José on WhatsApp.\n\n' +
        'STORES TO LOOK FOR: Small boutiques, gift shops, jewelry stores. Marbella area has many.\n\n' +
        'TIME NEEDED: 1-2 hours across a few days.'
      ),
    },
    {
      Name: title('💡 Add packaging, websites, and jewelry inspiration to the galleries'),
      Status: sel('⬜ Todo'),
      Assigned: sel('Ola'),
      Phase: sel('Phase 1 — Market Research'),
      Priority: sel('High'),
      'Due Date': date('2026-03-10'),
      Notes: text(
        'WHY: José needs to understand your visual taste — colors, fonts, packaging style, overall feeling — to design the brand around what you love.\n\n' +
        'WHAT TO ADD AND WHERE:\n\n' +
        '  📦 "Packaging Inspiration" gallery:\n' +
        '  → Screenshots of packaging you find beautiful (boxes, pouches, cards)\n' +
        '  → Search: "jewelry packaging", "handmade jewelry box", "clay jewelry packaging"\n\n' +
        '  🌐 "Websites & Brands I Like" gallery:\n' +
        '  → Screenshots or URLs of jewelry websites that feel right to you\n' +
        '  → Search: "polymer clay jewelry shop", "handmade jewelry boutique"\n\n' +
        '  💍 "Jewelry Inspiration" gallery:\n' +
        '  → Photos of jewelry (not yours) that you find beautiful or inspiring\n\n' +
        '  🤳 "My Photos" gallery:\n' +
        '  → Your best personal photos (wearing jewelry or not). Jose will use these for the AI photo tool.\n\n' +
        'TIME NEEDED: 20-30 minutes.\n\n' +
        'There are no wrong answers — this is your taste, your brand.'
      ),
    },
  ]

  for (const task of newTasks) {
    await addPage(TASKS_DB, task)
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // ─── Save IDs ───────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ Done!\n')
  console.log('New gallery IDs (add to .env.local if needed):')
  console.log(`NOTION_PACKAGING_DB_ID=${packaging.id}`)
  console.log(`NOTION_WEBSITES_DB_ID=${websites.id}`)
  console.log(`NOTION_JEWELRY_DB_ID=${jewelry.id}`)
  console.log(`NOTION_MODEL_DB_ID=${modelPhotos.id}`)
  console.log(`NOTION_MY_PRODUCTS_DB_ID=${myProducts.id}`)
  console.log('\nOla now has 3 clear tasks.')
  console.log('All 5 galleries are ready and waiting for her uploads.')
  console.log('═══════════════════════════════════════════════════')
}

main().catch(console.error)
