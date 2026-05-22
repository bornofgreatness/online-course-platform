import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { issueCertificate } from '../../../../../lib/issueCertificate'
import { recordCertificatePayment } from '../../../../../lib/certificatePayment'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')
  const courseId = url.searchParams.get('courseId')
  if (!sessionId || !courseId) {
    return NextResponse.json({ error: 'session_id and courseId are required' }, { status: 400 })
  }

  const stripe = new Stripe(secret)
  let checkout: Stripe.Checkout.Session
  try {
    checkout = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Invalid checkout session' }, { status: 400 })
  }

  if (checkout.payment_status !== 'paid') {
    return NextResponse.json(
      { error: 'Payment not completed', paymentStatus: checkout.payment_status },
      { status: 400 }
    )
  }

  if (checkout.metadata?.type !== 'certificate') {
    return NextResponse.json({ error: 'Not a certificate payment session' }, { status: 400 })
  }

  const userId = checkout.metadata?.userId
  const metaCourseId = checkout.metadata?.courseId
  if (!userId || metaCourseId !== courseId) {
    return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
  }

  const sessionUserId = (session.user as { id?: string }).id
  if (sessionUserId && sessionUserId !== userId) {
    return NextResponse.json({ error: 'Session does not belong to this user' }, { status: 403 })
  }

  const prisma = getPrisma()
  const amountBrl = (checkout.amount_total ?? 0) / 100

  try {
    await recordCertificatePayment(prisma, {
      userId,
      courseId,
      amountBrl,
      externalId: checkout.id,
      currency: checkout.currency || 'brl',
    })

    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    const result = await issueCertificate(prisma, userId, courseId, dbUser?.role)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      ok: true,
      certificate: result.certificate,
    })
  } catch (e) {
    console.error('certificate confirm', e)
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 })
  }
}
