/**
 * Blossom Jewellery Art — Populate Notion databases
 * Roadmap, Tasks, Products, Decisions Log
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env.local')
const env = readFileSync(envPath, 'utf-8')

const get = (key) => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim()

const API_KEY         = get('NOTION_API_KEY')
const ROADMAP_DB      = get('NOTION_ROADMAP_DB_ID')
const TASKS_DB        = get('NOTION_TASKS_DB_ID')
const PRODUCTS_DB     = get('NOTION_PRODUCTS_DB_ID')
const MARKET_DB       = get('NOTION_MARKET_DB_ID')
const B2B_DB          = get('NOTION_B2B_DB_ID')
const DECISIONS_DB    = get('NOTION_DECISIONS_DB_ID')

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

async function addPage(databaseId, properties) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data.message)}`)
  return data
}

const title = (text) => ({ title: [{ text: { content: text } }] })
const text  = (t)    => ({ rich_text: [{ text: { content: t } }] })
const sel   = (name) => ({ select: { name } })
const date  = (d)    => ({ date: { start: d } })
const num   = (n)    => ({ number: n })
const check = (b)    => ({ checkbox: b })

// ─── ROADMAP ─────────────────────────────────────────────────────────────────

const roadmapItems = [
  // PHASE 1
  {
    Name: title('Investigar joyerías locales (Ola visita tiendas)'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟡 In Progress'),
    Priority: sel('Critical'),
    'Start Date': date('2026-02-21'),
    'End Date': date('2026-03-07'),
    Notes: text('Ola visita joyerías y boutiques en su área. Fotografiar discret. productos, anotar precios y presentación. No hace falta hablar con nadie.'),
  },
  {
    Name: title('Analizar competencia online (Etsy, Instagram)'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-12'),
    'End Date': date('2026-02-21'),
    Notes: text('Análisis de mercado global completado. Ver docs/MARKET_ANALYSIS.md'),
  },
  {
    Name: title('Definir 6-10 productos de lanzamiento'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-01'),
    'End Date': date('2026-03-15'),
    Notes: text('Ola selecciona de su catálogo existente los productos que mejor representan la marca y son reproducibles. Criterios: que le gusten, que sean reproducibles, que tengan buena relación calidad-precio.'),
  },
  {
    Name: title('Estrategia de precios y márgenes'),
    Phase: sel('Phase 1 — Market Research'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-12'),
    'End Date': date('2026-02-21'),
    Notes: text('Estructura de precios definida. Retail 3-5x coste. Wholesale 50% del retail. Ver docs/PRICING_STRATEGY.md'),
  },

  // PHASE 2
  {
    Name: title('Diseñar packaging (tarjeta, bolsita, caja)'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-10'),
    'End Date': date('2026-03-31'),
    Notes: text('Ola diseña el packaging completo. Tarjeta de joya (con nombre marca, cuidados, web), bolsita de organza o kraft, caja opcional para sets. Colores: rosa suave + oro.'),
  },
  {
    Name: title('Fabricar 10-15 piezas de lanzamiento'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-03-15'),
    'End Date': date('2026-04-15'),
    Notes: text('Ola produce las piezas seleccionadas para el lanzamiento. Al menos 2-3 unidades de cada modelo para tener stock inicial.'),
  },
  {
    Name: title('Fotografía de producto (teléfono + luz natural)'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-01'),
    'End Date': date('2026-04-20'),
    Notes: text('Ola fotografia los productos. Setup básico: fondo blanco o mármol, luz natural lateral, teléfono en trípode. Múltiples ángulos por pieza. Fotos en uso (con modelo = Ola misma).'),
  },
  {
    Name: title('Rediseño web: paleta rosa+oro, estilo editorial'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🟢 Complete'),
    Priority: sel('High'),
    'Start Date': date('2026-02-21'),
    'End Date': date('2026-02-21'),
    Notes: text('Completado. Paleta actualizada de sage verde a blush rosa + oro cálido. Hero editorial bottom-anchored. Font 18px.'),
  },
  {
    Name: title('Subir productos reales a la web'),
    Phase: sel('Phase 2 — Identity & Product'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-20'),
    'End Date': date('2026-05-01'),
    Notes: text('José sube las fotos reales y descripciones a Sanity CMS. Activar Stripe en modo live.'),
  },

  // PHASE 3
  {
    Name: title('Visitar boutiques en Marbella (B2B pitch)'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-05-01'),
    'End Date': date('2026-05-20'),
    Notes: text('José visita boutiques premium en Marbella, Puerto Banús, Estepona. Llevar lookbook físico + muestras. Precio wholesale = 50% del retail.'),
  },
  {
    Name: title('Instagram: primeros 9 posts + bio'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('High'),
    'Start Date': date('2026-05-01'),
    'End Date': date('2026-05-15'),
    Notes: text('Ola prepara el grid inicial de Instagram. 9 posts coherentes visualmente. Bio clara: quién eres, qué haces, dónde comprar. Link a la web.'),
  },
  {
    Name: title('Configurar dominio y deployment producción'),
    Phase: sel('Phase 3 — Pre-launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-04-25'),
    'End Date': date('2026-05-01'),
    Notes: text('José: comprar dominio blossomjewellery.art, configurar DNS, desplegar en Railway, verificar email SPF/DKIM, activar Stripe live.'),
  },

  // PHASE 4
  {
    Name: title('Lanzamiento oficial'),
    Phase: sel('Phase 4 — Launch'),
    Status: sel('🔵 Planned'),
    Priority: sel('Critical'),
    'Start Date': date('2026-05-20'),
    Notes: text('Publicar web, anunciar en Instagram, enviar email a contactos. Monitorizar primeros pedidos.'),
  },
]

// ─── TASKS ───────────────────────────────────────────────────────────────────

const tasks = [
  // OLA — PHASE 1
  {
    Name: title('Visitar joyerías cercanas — anotar precios y fotos'),
    Status: sel('🔄 In Progress'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    Notes: text('Entrar como clienta. Fotografiar discretamente los productos (precio, presentación, estilo). No hace falta hablar ni explicar nada. Anotar: tipo de joya, precio, packaging visible, marca. Subir fotos a la base de datos "Market Research" aquí en Notion.'),
  },
  {
    Name: title('Buscar inspiración de packaging en Pinterest'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    Notes: text('Crear tablero de Pinterest "Blossom Packaging" con referencias de packaging de joyería que le gusten. Énfasis en: cajas, bolsas, tarjetas de joya, colores rosa y dorado.'),
  },
  {
    Name: title('Seleccionar 6-10 piezas de lanzamiento'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-15'),
    Notes: text('De todo el catálogo actual, elegir las piezas para lanzar primero. Criterios: (1) que le gusten mucho, (2) que pueda reproducirlas, (3) que representen bien la marca. Añadirlas a la base de datos "Products" aquí.'),
  },
  {
    Name: title('Buscar referencia fotográfica de estilo que le guste'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Medium'),
    Notes: text('Buscar en Instagram y Pinterest 10-20 fotos de joyería artesanal que le gusten visualmente. Guardarlas para definir el estilo fotográfico de Blossom.'),
  },

  // JOSÉ — PHASE 1
  {
    Name: title('Configurar Notion workspace y bases de datos'),
    Status: sel('✅ Done'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    Notes: text('Completado 2026-02-21. Workspace Blossom creado con 6 bases de datos: Roadmap, Tasks, Products, Market Research, B2B Leads, Decisions Log.'),
  },
  {
    Name: title('Rediseñar web: paleta rosa+oro'),
    Status: sel('✅ Done'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    Notes: text('Completado 2026-02-21. Paleta actualizada. Hero editorial. Fuente 18px.'),
  },
  {
    Name: title('Investigar proveedores de packaging en España'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Medium'),
    'Due Date': date('2026-03-15'),
    Notes: text('Buscar proveedores de: cajas de joyería, bolsas de organza, tarjetas de presentación, papel de seda. Requisitos: pedido mínimo bajo, precio razonable, calidad aceptable. Referencias: Alibaba, Packly, Made in Design.'),
  },
  {
    Name: title('Preparar lista de boutiques en Marbella a visitar'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('High'),
    'Due Date': date('2026-04-01'),
    Notes: text('Buscar en Google Maps boutiques y joyerías en: Marbella centro, Puerto Banús, Golden Mile, Estepona, Benahavís. Añadir a la base "B2B Leads" con nombre, dirección, tipo de tienda.'),
  },

  // OLA — PHASE 2
  {
    Name: title('Diseñar tarjeta de joya (nombre, cuidados, web)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-31'),
    Notes: text('Tarjeta pequeña que acompañará cada joya. Contenido: nombre de la pieza (opcional), instrucciones de cuidado (evitar agua, perfume, sudor), web blossomjewellery.art, Instagram @blossomjewelleryart. Diseño: rosa suave + dorado, elegante y minimalista.'),
  },
  {
    Name: title('Diseñar bolsita/caja de presentación'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-03-31'),
    Notes: text('Elegir entre bolsa de organza, bolsa kraft o caja pequeña. Preferiblemente algo que se pueda personalizar con etiqueta adhesiva o estampado. Pensar en el unboxing: ¿qué siente alguien al recibirlo?'),
  },
  {
    Name: title('Fabricar piezas de lanzamiento (stock inicial)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-04-15'),
    Notes: text('Producir 2-3 unidades de cada pieza seleccionada. Total: ~25-30 piezas para el lanzamiento. Priorizar las que más le gusten y las que sean más fotogénicas.'),
  },
  {
    Name: title('Fotografiar productos (setup básico en casa)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-04-20'),
    Notes: text('Setup: fondo blanco (cartulina o tela), luz natural de ventana lateral, teléfono en trípode. Por cada pieza: 3-4 fotos (frontal, detalle, en mano/cuello, con packaging). Hora ideal: mañana con sol suave.'),
  },

  // JOSÉ — PHASE 2
  {
    Name: title('Subir fotos reales a Sanity CMS'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('Cuando Ola tenga las fotos listas, José las sube a Sanity CMS y actualiza las fichas de producto con fotos reales, precios definitivos y descripciones.'),
  },
  {
    Name: title('Activar Stripe en modo live (pagos reales)'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 2 — Identity & Product'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('Crear cuenta Stripe, verificar identidad, añadir cuenta bancaria. Cambiar keys de test a live en .env.local. Hacer pedido de prueba real de 1€.'),
  },

  // PHASE 3 — BOTH
  {
    Name: title('Invitar a Ola al workspace de Notion'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 1 — Market Research'),
    Priority: sel('Critical'),
    'Due Date': date('2026-02-28'),
    Notes: text('Settings → People → Invite → email de Ola. Darle acceso a todas las bases de datos.'),
  },
  {
    Name: title('Visitar boutiques Marbella — pitch B2B'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-20'),
    Notes: text('Llevar: lookbook impreso (fotos de producto + precios wholesale), 2-3 muestras físicas, tarjeta de visita. Discurso: "Joyería artesanal de arcilla polimérica, hecha a mano en Europa, precio wholesale €X". Registrar resultado en B2B Leads.'),
  },
  {
    Name: title('Crear bio y primeros 9 posts de Instagram'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Ola'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('High'),
    'Due Date': date('2026-05-15'),
    Notes: text('Bio: nombre, qué haces, dónde comprar (link web). 9 primeros posts coherentes: mix de producto solo, producto en uso, proceso de creación, packaging. Consistencia visual: tonos claros, fondo neutro.'),
  },
  {
    Name: title('Configurar dominio + deployment producción'),
    Status: sel('⬜ Todo'),
    Assigned: sel('José'),
    Phase: sel('Phase 3 — Pre-launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-01'),
    Notes: text('1. Comprar dominio blossomjewellery.art\n2. Configurar DNS\n3. Deploy en Railway con variables de entorno\n4. Verificar email (SPF, DKIM, DMARC)\n5. Activar SSL\n6. Test completo de la tienda'),
  },
  {
    Name: title('Lanzamiento: anuncio en Instagram + email'),
    Status: sel('⬜ Todo'),
    Assigned: sel('Both'),
    Phase: sel('Phase 4 — Launch'),
    Priority: sel('Critical'),
    'Due Date': date('2026-05-20'),
    Notes: text('Publicar post de lanzamiento en Instagram. Enviar email a lista de contactos. Activar tienda online. Monitorizar primeros pedidos juntos.'),
  },
]

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

const products = [
  // Ukrainian Heritage
  { name: 'Embroidered Circle Earrings', collection: 'Ukrainian Heritage', type: 'Earrings', retail: 28, wholesale: 14, cost: 6, status: '📸 Needs Photography' },
  { name: 'Red Vyshyvanka Drop Earrings', collection: 'Ukrainian Heritage', type: 'Earrings', retail: 32, wholesale: 16, cost: 7, status: '📸 Needs Photography' },
  { name: 'Heritage Statement Necklace', collection: 'Ukrainian Heritage', type: 'Necklace', retail: 55, wholesale: 28, cost: 12, status: '📸 Needs Photography' },
  // Red Roses
  { name: 'Red Rose Stud Earrings', collection: 'Red Roses', type: 'Earrings', retail: 24, wholesale: 12, cost: 5, status: '📸 Needs Photography' },
  { name: 'Red Rose Drop Earrings', collection: 'Red Roses', type: 'Earrings', retail: 29, wholesale: 15, cost: 6, status: '📸 Needs Photography' },
  // Pink Roses
  { name: 'Blush Rose Stud Earrings', collection: 'Pink Roses', type: 'Earrings', retail: 24, wholesale: 12, cost: 5, status: '📸 Needs Photography' },
  { name: 'Pink Rose Necklace', collection: 'Pink Roses', type: 'Necklace', retail: 48, wholesale: 24, cost: 10, status: '📸 Needs Photography' },
  // Yellow Roses
  { name: 'Yellow Rose Drop Earrings', collection: 'Yellow Roses', type: 'Earrings', retail: 26, wholesale: 13, cost: 5, status: '📸 Needs Photography' },
  // Orchid Dreams
  { name: 'Purple Orchid Earrings', collection: 'Orchid Dreams', type: 'Earrings', retail: 32, wholesale: 16, cost: 7, status: '📸 Needs Photography' },
  { name: 'Orchid Statement Necklace', collection: 'Orchid Dreams', type: 'Necklace', retail: 58, wholesale: 29, cost: 13, status: '📸 Needs Photography' },
  // Dark Bloom
  { name: 'Dark Bloom Earrings', collection: 'Dark Bloom', type: 'Earrings', retail: 35, wholesale: 18, cost: 8, status: '📸 Needs Photography' },
  // Peony Delicates
  { name: 'Peony Mini Studs', collection: 'Peony Delicates', type: 'Earrings', retail: 22, wholesale: 11, cost: 4, status: '📸 Needs Photography' },
  { name: 'Peony Drop Earrings', collection: 'Peony Delicates', type: 'Earrings', retail: 30, wholesale: 15, cost: 6, status: '📸 Needs Photography' },
  // Mediterranean Garden
  { name: 'Garden Blossom Necklace', collection: 'Mediterranean Garden', type: 'Necklace', retail: 52, wholesale: 26, cost: 11, status: '📸 Needs Photography' },
  { name: 'Mediterranean Hoop Earrings', collection: 'Mediterranean Garden', type: 'Earrings', retail: 34, wholesale: 17, cost: 7, status: '📸 Needs Photography' },
  // Stud Earrings
  { name: 'Classic Clay Studs Set', collection: 'Peony Delicates', type: 'Set', retail: 45, wholesale: 23, cost: 10, status: '📸 Needs Photography' },
]

// ─── DECISIONS ───────────────────────────────────────────────────────────────

const decisions = [
  {
    Decision: title('Plataforma: Next.js + Sanity CMS (no Shopify)'),
    Area: sel('Tech'),
    'Made By': sel('José'),
    Date: date('2026-02-12'),
    Rationale: text('Shopify tiene fees del 2-3% por venta + cuota mensual de €29-79. Con Next.js propio el coste es solo hosting (~€20/mes Railway). A largo plazo es más barato y da control total.'),
  },
  {
    Decision: title('Precio retail base: 3-5x coste de producción'),
    Area: sel('Business'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Estándar del mercado artesanal. Permite margen wholesale del 50% sin perder rentabilidad. Rango: €22-58 según pieza.'),
  },
  {
    Decision: title('Modelo wholesale: 50% del precio retail'),
    Area: sel('Business'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Estándar para B2B en joyería. Permite a las tiendas tener margen de 100% (markup 2x). Si retail es €30, wholesale es €15.'),
  },
  {
    Decision: title('Paleta de marca: rosa suave + oro cálido (sin verde sage)'),
    Area: sel('Design'),
    'Made By': sel('Both'),
    Date: date('2026-02-21'),
    Rationale: text('Rosa suave = femenino, premium, editorial. Oro cálido = lujo accesible, artesanal. Eliminamos el verde sage que daba un look demasiado "orgánico/natural" y no encajaba con el posicionamiento premium.'),
  },
  {
    Decision: title('Idiomas web: Español, Inglés, Ucraniano'),
    Area: sel('Product'),
    'Made By': sel('Both'),
    Date: date('2026-02-15'),
    Rationale: text('Español: mercado local Costa del Sol. Inglés: turistas y mercado internacional. Ucraniano: comunidad de Ola y clientes potenciales de Europa del Este.'),
  },
  {
    Decision: title('Canal principal: Instagram + web propia (no Etsy al inicio)'),
    Area: sel('Marketing'),
    'Made By': sel('Both'),
    Date: date('2026-02-12'),
    Rationale: text('Etsy tiene fees del 6.5% + €0.20 por listing + conversión de moneda. Instagram como canal de descubrimiento + web propia para conversión. Etsy como canal secundario una vez establecidos.'),
  },
  {
    Decision: title('Notion como herramienta de colaboración central'),
    Area: sel('Business'),
    'Made By': sel('José'),
    Date: date('2026-02-21'),
    Rationale: text('José en Marbella, Ola en otro país. Notion permite compartir roadmap, tareas, catálogo de productos y research sin reuniones. Integrado con la web vía API de Notion.'),
  },
]

// ─── Execute ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌸 Populating Blossom Notion databases...\n')

  // Roadmap
  console.log(`🗺️  Adding ${roadmapItems.length} roadmap items...`)
  for (const item of roadmapItems) {
    await addPage(ROADMAP_DB, item)
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // Tasks
  console.log(`✅ Adding ${tasks.length} tasks...`)
  for (const task of tasks) {
    await addPage(TASKS_DB, task)
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // Products
  console.log(`💍 Adding ${products.length} products...`)
  for (const p of products) {
    await addPage(PRODUCTS_DB, {
      Name: title(p.name),
      Collection: sel(p.collection),
      Type: sel(p.type),
      Status: sel(p.status),
      'Retail Price (€)': num(p.retail),
      'Wholesale Price (€)': num(p.wholesale),
      'Cost to Make (€)': num(p.cost),
      'In Stock': check(false),
    })
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  // Decisions
  console.log(`📋 Adding ${decisions.length} decisions...`)
  for (const d of decisions) {
    await addPage(DECISIONS_DB, d)
    process.stdout.write('.')
  }
  console.log(' ✓\n')

  console.log('═══════════════════════════════════════════')
  console.log('✅ All databases populated!')
  console.log(`   Roadmap:   ${roadmapItems.length} items`)
  console.log(`   Tasks:     ${tasks.length} tasks`)
  console.log(`   Products:  ${products.length} products`)
  console.log(`   Decisions: ${decisions.length} decisions`)
  console.log('═══════════════════════════════════════════')
}

main().catch(console.error)
