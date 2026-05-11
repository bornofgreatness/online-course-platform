import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getPrisma } from '../../../../lib/prisma'


function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 })
    }

    const prisma = getPrisma()

    const user = await prisma.user.findUnique({ where: { email } })
    // Avoid user enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Create reset token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

    // Hash token before storing
    const tokenHash = await bcrypt.hash(token, 10)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const urlBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
    const resetUrl = `${urlBase}/auth/reset-password?token=${encodeURIComponent(token)}`

    // Email sending via Resend REST API (no dependency needed)
    const from = process.env.RESEND_FROM_EMAIL || 'no-reply@example.com'
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Reset your password',
        html: `
          <div>
            <p>You requested a password reset.</p>
            <p><a href="${resetUrl}">Reset password</a></p>
            <p>This link expires in 30 minutes.</p>
          </div>
        `,
      }),
    })

    if (!resendResponse.ok) {
      const text = await resendResponse.text().catch(() => '')
      throw new Error(`Failed to send email via Resend (${resendResponse.status}): ${text}`)
    }


    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send password reset email' }, { status: 500 })
  }
}

