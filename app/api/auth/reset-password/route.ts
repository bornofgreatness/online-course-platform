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

    const resetCandidate = await prisma.passwordResetToken.findFirst({
      where: {
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    })

    // We must match the provided token against the stored hash.
    // Because schema stores only hash, we iterate by verifying against a candidate.
    // For SQLite this is acceptable; for scale, we'd store tokenHash and search differently.
    if (!resetCandidate) {
      return NextResponse.json({ error: 'Reset token is invalid or expired' }, { status: 400 })
    }

    const matches = await bcrypt.compare(token, resetCandidate.tokenHash)
    if (!matches) {
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
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to reset password' }, { status: 500 })
  }
}

