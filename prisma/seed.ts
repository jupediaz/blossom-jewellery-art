import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, UserRole } from '../src/generated/prisma/client'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'changeme-in-production'
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@blossomjewellery.art'

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'José Díaz',
      passwordHash: await hash(adminPassword, 12),
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      locale: 'en',
      currency: 'EUR',
    },
  })
  console.log(`Admin user created: ${admin.email}`)

  // Create product manager user (Olha)
  const pmEmail = process.env.PM_SEED_EMAIL || 'olha@blossomjewellery.art'
  const pmPassword = process.env.PM_SEED_PASSWORD || 'changeme-in-production'

  const pm = await prisma.user.upsert({
    where: { email: pmEmail },
    update: {},
    create: {
      email: pmEmail,
      name: 'Olha',
      passwordHash: await hash(pmPassword, 12),
      role: UserRole.PRODUCT_MANAGER,
      emailVerified: new Date(),
      locale: 'uk',
      currency: 'EUR',
    },
  })
  console.log(`Product manager created: ${pm.email}`)

  // Seed shipping zones
  const spainZone = await prisma.shippingZone.upsert({
    where: { id: 'zone-spain' },
    update: {},
    create: {
      id: 'zone-spain',
      name: 'Spain (Domestic)',
      countries: ['ES'],
      freeShippingThreshold: 60,
    },
  })

  const euZone = await prisma.shippingZone.upsert({
    where: { id: 'zone-eu' },
    update: {},
    create: {
      id: 'zone-eu',
      name: 'European Union',
      countries: [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'SE',
      ],
      freeShippingThreshold: 100,
    },
  })

  const ukZone = await prisma.shippingZone.upsert({
    where: { id: 'zone-uk' },
    update: {},
    create: {
      id: 'zone-uk',
      name: 'United Kingdom',
      countries: ['GB'],
    },
  })

  const americasZone = await prisma.shippingZone.upsert({
    where: { id: 'zone-americas' },
    update: {},
    create: {
      id: 'zone-americas',
      name: 'Americas',
      countries: ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO'],
    },
  })

  const rowZone = await prisma.shippingZone.upsert({
    where: { id: 'zone-row' },
    update: {},
    create: {
      id: 'zone-row',
      name: 'Rest of World',
      countries: ['UA', 'AU', 'JP', 'KR', 'SG', 'AE', 'IL'],
    },
  })

  // Seed shipping methods
  const zones = [
    { zone: spainZone, methods: [
      { name: 'Standard', rate: 3.50, min: 3, max: 5 },
      { name: 'Express', rate: 6.50, min: 1, max: 2 },
    ]},
    { zone: euZone, methods: [
      { name: 'Standard', rate: 7.50, min: 5, max: 10 },
      { name: 'Express', rate: 12.00, min: 2, max: 4 },
    ]},
    { zone: ukZone, methods: [
      { name: 'Standard', rate: 9.00, min: 5, max: 10 },
      { name: 'Express', rate: 15.00, min: 3, max: 5 },
    ]},
    { zone: americasZone, methods: [
      { name: 'Standard', rate: 12.00, min: 7, max: 14 },
      { name: 'Express', rate: 20.00, min: 3, max: 7 },
    ]},
    { zone: rowZone, methods: [
      { name: 'Standard', rate: 15.00, min: 10, max: 21 },
      { name: 'Express', rate: 25.00, min: 5, max: 10 },
    ]},
  ]

  for (const { zone, methods } of zones) {
    for (const method of methods) {
      await prisma.shippingMethod.create({
        data: {
          zoneId: zone.id,
          name: method.name,
          rate: method.rate,
          estimatedDaysMin: method.min,
          estimatedDaysMax: method.max,
        },
      })
    }
  }
  console.log('Shipping zones and methods seeded')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
