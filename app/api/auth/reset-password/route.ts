import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const prisma = getPrisma()

    const resetCandidates = await prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    let resetCandidate: (typeof resetCandidates)[number] | null = null
    for (const candidate of resetCandidates) {
      if (await bcrypt.compare(token, candidate.tokenHash)) {
        resetCandidate = candidate
        break
      }
    }

    if (!resetCandidate) {
      return NextResponse.json({ error: 'Reset token is invalid or expired' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: resetCandidate.userId },
        data: { password: hashedPassword },
      })
      await tx.passwordResetToken.update({
        where: { id: resetCandidate.id },
        data: { used: true },
      })
      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetCandidate.userId,
          used: false,
        },
        data: { used: true },
      })
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to reset password' }, { status: 500 })
  }
}

