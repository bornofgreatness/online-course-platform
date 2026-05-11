import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

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
    }
  })

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