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

    // IMPORTANT: token is stored as a hash, so we validate against the earliest un-used token.
    const candidate = await prisma.emailVerificationToken.findFirst({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'Verification token is invalid or expired' }, { status: 400 })
    }

    const matches = await bcrypt.compare(token, candidate.tokenHash)
    if (!matches) {
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

