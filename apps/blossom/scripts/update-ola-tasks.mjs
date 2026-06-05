/**
 * Update Ola's tasks in Notion — simplified, focused, psychologically sound
 * Also creates an Inspiration Board database for visual references
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')
const env = readFileSync(envPath, 'utf-8')
const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim()

const API_KEY      = get('NOTION_API_KEY')
const TASKS_DB     = get('NOTION_TASKS_DB_ID')
const HUB_PAGE     = get('NOTION_HUB_PAGE_ID')

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

// ─── 1. Archive ALL current Ola tasks ────────────────────────────────────────

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

// ─── 2. Also update José's "Invite Ola" task to more urgent ──────────────────

// ─── 3. New Ola tasks — simple, clear, doable from phone ─────────────────────

const olaTasks = [
  // ── THIS WEEK ────────────────────────────────────────────────────────────
  {
    Name: title('📸 Take photos of your 10 favourite pieces you have already made'),
    Status: sel('🔄 In Progress'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-01'),
    Notes: text(
      'WHY: José needs these to set up the website and build the AI photo tool that will turn your photos into professional product shots.\n\n' +
      'HOW: Use your phone. Any background is fine — even a table or your bed. Just make sure there is good light (near a window). One photo per piece from the front.\n\n' +
      'WHAT TO DO WITH THEM: Upload them here in Notion (drag and drop into this task), or send them to José on WhatsApp.\n\n' +
      'TIME NEEDED: ~30 minutes.\n\n' +
      'NOTE: Do not worry about perfect lighting or background. José will handle all the visual enhancement with AI. Just send the pieces.'
    ),
  },
  {
    Name: title('🔍 Visit 2-3 jewelry stores near you — just look and photograph'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-07'),
    Notes: text(
      'WHY: We need to know what\'s selling near you, at what prices, and how it\'s presented. This will help us price your pieces correctly and understand the competition.\n\n' +
      'HOW: Go in as a normal customer. You do NOT need to talk to anyone, explain anything, or say you make jewelry. Just browse and discreetly photograph:\n' +
      '  • The pieces on display (type, style)\n' +
      '  • The price tags\n' +
      '  • The packaging if visible\n\n' +
      'WHAT TO DO WITH THEM: Upload the photos to the "Market Research" database in Notion, or send them to José on WhatsApp.\n\n' +
      'STORES TO LOOK FOR: Small boutiques, gift shops, local jewelry stores. You live near Marbella — there are many options.\n\n' +
      'TIME NEEDED: 1-2 hours total across a few days. No rush.\n\n' +
      'NOTE: If you feel uncomfortable going in, that is completely okay. Even driving past and photographing the window is useful.'
    ),
  },
  {
    Name: title('💡 Screenshot packaging & websites you like — upload to Inspiration Board'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    'Due Date': date('2026-03-10'),
    Notes: text(
      'WHY: Jose needs to understand your taste — colors, fonts, packaging style, overall feel — to make the website and branding match what you love.\n\n' +
      'WHAT TO COLLECT (screenshots from your phone or laptop):\n' +
      '  • 5-10 packaging examples you find beautiful (boxes, pouches, cards)\n' +
      '  • 3-5 jewelry brand websites that feel right to you\n' +
      '  • Any jewelry photos (not yours) that make you think "I wish mine looked like this"\n\n' +
      'HOW TO FIND THEM: Search Instagram for "polymer clay jewelry", "handmade jewelry boutique", "jewelry packaging". Pinterest also works but save screenshots.\n\n' +
      'WHERE TO UPLOAD: Go to "Inspiration Board" in Notion (in the Blossom Project Hub) and add your screenshots there.\n\n' +
      'TIME NEEDED: 20-30 minutes.\n\n' +
      'NOTE: There are no wrong answers here. This is purely about your personal taste. What do you find beautiful?'
    ),
  },
]

// ─── 4. Create Inspiration Board database ────────────────────────────────────

async function createInspirationBoard() {
  return api('/databases', 'POST', {
    parent: { page_id: HUB_PAGE },
    icon: { type: 'emoji', emoji: '🎨' },
    title: [{ type: 'text', text: { content: 'Inspiration Board' } }],
    properties: {
      Name: { title: {} },
      Category: {
        select: {
          options: [
            { name: '📦 Packaging', color: 'pink' },
            { name: '🌐 Website / Brand', color: 'blue' },
            { name: '💍 Jewelry Style', color: 'purple' },
            { name: '🎨 Colors / Mood', color: 'orange' },
            { name: '📸 Photography Style', color: 'yellow' },
          ],
        },
      },
      'Added by': {
        select: {
          options: [
            { name: 'Ola', color: 'pink' },
            { name: 'José', color: 'blue' },
          ],
        },
      },
      Link: { url: {} },
      Notes: { rich_text: {} },
    },
  })
}

// ─── Seed a few starter entries in the Inspiration Board ─────────────────────

async function seedInspirationBoard(dbId) {
  const entries = [
    {
      Name: title('-- Add packaging screenshots here --'),
      Category: sel('📦 Packaging'),
      'Added by': sel('Ola'),
      Notes: text('Drag and drop your screenshots into this entry, or create new entries for each reference. Show José what packaging style you love.'),
    },
    {
      Name: title('-- Add websites you find beautiful here --'),
      Category: sel('🌐 Website / Brand'),
      'Added by': sel('Ola'),
      Notes: text('Copy the URL of any jewelry website or Instagram account you love. José will use this to shape the look of blossomjewellery.art'),
    },
    {
      Name: title('-- Add jewelry style references here --'),
      Category: sel('💍 Jewelry Style'),
      'Added by': sel('Ola'),
      Notes: text('Photos of other jewelry (not yours) that you think are beautiful or inspire you. Helps define the visual direction of the brand.'),
    },
    // A few real references to get her started
    {
      Name: title('Wolf & Moon — clean editorial polymer clay jewelry site'),
      Category: sel('🌐 Website / Brand'),
      'Added by': sel('José'),
      Link: { url: 'https://www.wolfandmoon.com' },
      Notes: text('Good reference for: clean white background, editorial product photos, minimal typography, pricing structure.'),
    },
    {
      Name: title('Erstwhile Jewelry — warm, editorial tone'),
      Category: sel('🌐 Website / Brand'),
      'Added by': sel('José'),
      Link: { url: 'https://www.erstwhilejewelry.com' },
      Notes: text('Reference for: warm photography, product storytelling, brand voice.'),
    },
  ]

  for (const entry of entries) {
    await api('/pages', 'POST', { parent: { database_id: dbId }, properties: entry })
    process.stdout.write('.')
  }
}

async function addPage(databaseId, properties) {
  return api('/pages', 'POST', { parent: { database_id: databaseId }, properties })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Simplifying Ola\'s tasks...\n')

  // Archive old Ola tasks
  console.log('🗑️  Archiving old Ola tasks...')
  const archived = await archiveOlaTasks()
  console.log(`   ✓ Archived ${archived} tasks\n`)

  // Add new focused tasks
  console.log('✅ Adding 3 focused tasks for Ola...')
  for (const task of olaTasks) {
    await addPage(TASKS_DB, task)
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // Create Inspiration Board
  console.log('🎨 Creating Inspiration Board database...')
  const board = await createInspirationBoard()
  console.log(`   ✓ Created: ${board.url}\n`)

  // Seed it
  console.log('🌱 Adding starter entries to Inspiration Board...')
  await seedInspirationBoard(board.id)
  console.log(' ✓\n')

  // Save board ID to env
  console.log('💾 Saving Inspiration Board ID...')
  console.log(`   NOTION_INSPIRATION_DB_ID=${board.id}`)

  console.log('\n═══════════════════════════════════════════════════')
  console.log('✅ Done.')
  console.log('\nOla now has ONLY 3 tasks:')
  console.log('  1. 📸 Photo her 10 favourite existing pieces  [URGENT]')
  console.log('  2. 🔍 Visit 2-3 stores near her              [THIS WEEK]')
  console.log('  3. 💡 Upload inspiration to Notion board     [THIS WEEK]')
  console.log('\nJosé\'s tasks are unchanged.')
  console.log('═══════════════════════════════════════════════════')
}

main().catch(console.error)
