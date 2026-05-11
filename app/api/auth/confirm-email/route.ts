import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    // IMPORTANT: token is stored as a hash, so validate it against active tokens.
    const candidates = await prisma.emailVerificationToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    })

    let candidate = null
    for (const item of candidates) {
      if (await bcrypt.compare(token, item.tokenHash)) {
        candidate = item
        break
      }
    }

    if (!candidate) {
      return NextResponse.json({ error: 'Verification token is invalid or expired' }, { status: 400 })
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: candidate.userId },
        data: { emailVerifiedAt: new Date() },
      })
      await tx.emailVerificationToken.update({
        where: { id: candidate.id },
        data: { used: true },
      })
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to verify email' }, { status: 500 })
  }
}

