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
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
    const tokenHash = await bcrypt.hash(token, 10)

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        used: false,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const urlBase = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
    const verifyUrl = `${urlBase}/auth/verify-email?token=${encodeURIComponent(token)}`

    const from = process.env.RESEND_FROM_EMAIL || 'no-reply@example.com'

    // Send verification email using Resend REST API without requiring the SDK.
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: 'Verify your email',
        html: `
          <div>
            <p>Welcome!</p>
            <p>Please verify your email by clicking below:</p>
            <p><a href="${verifyUrl}">Verify email</a></p>
            <p>This link expires in 1 hour.</p>
          </div>
        `,
      }),
    })

    if (!resendResponse.ok) {
      const text = await resendResponse.text().catch(() => '')
      throw new Error(`Failed to send verification email via Resend (${resendResponse.status}): ${text}`)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send verification email' }, { status: 500 })
  }
}

