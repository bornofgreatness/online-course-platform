import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'
import { clientIp, rateLimit } from '../../../../lib/rateLimit'

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const rl = rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 })
  }

  const { email, password, name, whatsapp, address, city, state, referralCode } = await request.json()

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database connection is not configured' }, { status: 500 })
  }

  const prisma = getPrisma()

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      whatsapp: typeof whatsapp === 'string' ? whatsapp.trim() : undefined,
      address: typeof address === 'string' ? address.trim() : undefined,
      city: typeof city === 'string' ? city.trim() : undefined,
      state: typeof state === 'string' ? state.trim().toUpperCase().slice(0, 2) : undefined,
    },
  })

  if (referralCode && typeof referralCode === 'string') {
    const code = referralCode.trim()
    if (code.length >= 4) {
      const affiliate = await prisma.affiliate.findFirst({
        where: { referralCode: { equals: code, mode: 'insensitive' } },
      })
      if (affiliate && affiliate.userId !== user.id) {
        const already = await prisma.referral.findFirst({ where: { referredUserId: user.id } })
        if (!already) {
          await prisma.referral.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: user.id,
            },
          })
        }
      }
    }
  }

  let verifyUrl: string | null = null

  // Send email verification (best-effort)
  try {
    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/send-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const verifyData = await verifyRes.json().catch(() => null)
    if (verifyRes.ok && verifyData?.verifyUrl) {
      verifyUrl = verifyData.verifyUrl
    }
  } catch {
    // ignore to not block registration
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
    verifyUrl,
  })
}