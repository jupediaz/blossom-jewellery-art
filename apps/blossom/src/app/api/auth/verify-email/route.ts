import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { token, email } = body
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const verificationToken = await db.verificationToken.findFirst({
    where: {
      identifier: `verify:${email}`,
      token: hashedToken,
      expires: { gt: new Date() },
    },
  })

  if (!verificationToken) {
    return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 })
  }

  await db.$transaction([
    db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    db.verificationToken.delete({
      where: { identifier_token: { identifier: `verify:${email}`, token: hashedToken } },
    }),
  ])

  return NextResponse.json({ success: true })
}
