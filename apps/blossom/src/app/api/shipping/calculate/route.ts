import { NextRequest, NextResponse } from 'next/server'

// Default shipping zones when database is not available
const DEFAULT_ZONES = [
  {
    name: "Spain",
    countries: ["ES"],
    freeShippingThreshold: 60,
    methods: [
      { id: "es-standard", name: "Standard", rate: 3.5, estimatedDaysMin: 2, estimatedDaysMax: 4 },
      { id: "es-express", name: "Express", rate: 6.5, estimatedDaysMin: 1, estimatedDaysMax: 2 },
    ],
  },
  {
    name: "EU",
    countries: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","SE"],
    freeShippingThreshold: 100,
    methods: [
      { id: "eu-standard", name: "Standard", rate: 7.5, estimatedDaysMin: 5, estimatedDaysMax: 10 },
      { id: "eu-express", name: "Express", rate: 12, estimatedDaysMin: 3, estimatedDaysMax: 5 },
    ],
  },
  {
    name: "UK",
    countries: ["GB"],
    freeShippingThreshold: null,
    methods: [
      { id: "uk-standard", name: "Standard", rate: 9, estimatedDaysMin: 7, estimatedDaysMax: 14 },
      { id: "uk-express", name: "Express", rate: 15, estimatedDaysMin: 3, estimatedDaysMax: 7 },
    ],
  },
  {
    name: "Americas",
    countries: ["US","CA","MX","BR","AR","CL","CO"],
    freeShippingThreshold: null,
    methods: [
      { id: "am-standard", name: "Standard", rate: 12, estimatedDaysMin: 10, estimatedDaysMax: 20 },
      { id: "am-express", name: "Express", rate: 20, estimatedDaysMin: 5, estimatedDaysMax: 10 },
    ],
  },
  {
    name: "Rest of World",
    countries: ["*"],
    freeShippingThreshold: null,
    methods: [
      { id: "row-standard", name: "Standard", rate: 15, estimatedDaysMin: 14, estimatedDaysMax: 30 },
      { id: "row-express", name: "Express", rate: 25, estimatedDaysMin: 7, estimatedDaysMax: 14 },
    ],
  },
]

export async function POST(req: NextRequest) {
  const { countryCode, subtotal } = await req.json()

  if (!countryCode) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 })
  }

  const code = countryCode.toUpperCase()

  // Try database first, fall back to defaults
  let zoneData: typeof DEFAULT_ZONES[0] | undefined

  try {
    const { db } = await import('@/lib/db')
    const zones = await db.shippingZone.findMany({
      where: { isActive: true },
      include: { methods: { where: { isActive: true }, orderBy: { rate: 'asc' } } },
    })

    const dbZone = zones.find((z) => z.countries.includes(code))
    if (dbZone) {
      zoneData = {
        name: dbZone.name,
        countries: dbZone.countries,
        freeShippingThreshold: dbZone.freeShippingThreshold ? Number(dbZone.freeShippingThreshold) : null,
        methods: dbZone.methods.map((m) => ({
          id: m.id,
          name: m.name,
          rate: Number(m.rate),
          estimatedDaysMin: m.estimatedDaysMin,
          estimatedDaysMax: m.estimatedDaysMax,
        })),
      }
    }
  } catch {
    // Database not available — use defaults
  }

  if (!zoneData) {
    zoneData = DEFAULT_ZONES.find((z) => z.countries.includes(code))
      || DEFAULT_ZONES.find((z) => z.countries.includes("*"))
  }

  if (!zoneData) {
    return NextResponse.json({ error: 'We do not currently ship to this country' }, { status: 400 })
  }

  const qualifiesForFreeShipping =
    zoneData.freeShippingThreshold != null && subtotal >= zoneData.freeShippingThreshold

  const methods = zoneData.methods.map((method) => ({
    id: method.id,
    name: method.name,
    rate: qualifiesForFreeShipping ? 0 : method.rate,
    originalRate: method.rate,
    estimatedDaysMin: method.estimatedDaysMin,
    estimatedDaysMax: method.estimatedDaysMax,
    freeShipping: qualifiesForFreeShipping,
  }))

  return NextResponse.json({
    zone: { name: zoneData.name },
    methods,
    freeShippingThreshold: zoneData.freeShippingThreshold,
    qualifiesForFreeShipping,
  })
}
