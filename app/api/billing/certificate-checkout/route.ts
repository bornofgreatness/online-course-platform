import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { authErrorResponse, requireSession } from '../../../../lib/auth/session'
import { canDownloadCertificates } from '../../../../lib/auth/rbac'
import {
  certificateFeeWaivedForRole,
  isCertificateFeeRequired,
} from '../../../../lib/assertCertificateFee'
import { getPrisma } from '../../../../lib/prisma'
import { getActiveSubscription } from '../../../../lib/subscription'
import {
  CERTIFICATE_ISSUANCE_FEE_BRL,
  CERTIFICATE_ISSUANCE_FEE_CENTS,
  formatCertificateFeeBrl,
} from '../../../../lib/certificatePolicy'
import { assertEligibleForCertificate } from '../../../../lib/issueCertificate'
import { hasPaidCertificateFee } from '../../../../lib/certificatePayment'
import { stripeCheckoutPaymentMethods } from '../../../../lib/stripeCheckout'
import {
  isMercadoPagoConfigured,
  createMercadoPagoCertificatePreference,
} from '../../../../lib/mercadoPago'
import {
  isStripeConfigured,
  isStripePaymentEnabled,
  preferMercadoPagoCheckout,
} from '../../../../lib/billingProvider'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { user } = await requireSession()
    const prisma = getPrisma()
    const sub = await getActiveSubscription(prisma, user.id)

    if (!canDownloadCertificates(user.role, !!sub)) {
      return NextResponse.json(
        { error: 'An active subscription is required to request certificates.' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const courseId = typeof body?.courseId === 'string' ? body.courseId : ''
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Certificate already issued', certificate: existing }, { status: 400 })
    }

    const eligible = await assertEligibleForCertificate(prisma, user.id, courseId)
    if (!eligible.ok) {
      return NextResponse.json({ error: eligible.error }, { status: eligible.status })
    }

    if (!isCertificateFeeRequired(user.role)) {
      return NextResponse.json({
        paymentRequired: false,
        feeWaived: certificateFeeWaivedForRole(user.role),
        message: 'Certificate fee not required for this account',
      })
    }

    if (await hasPaidCertificateFee(prisma, user.id, courseId)) {
      return NextResponse.json({
        paymentRequired: false,
        alreadyPaid: true,
        message: 'Fee already paid — call POST /api/certificates to issue',
      })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'

    if (preferMercadoPagoCheckout() && isMercadoPagoConfigured()) {
      const preference = await createMercadoPagoCertificatePreference({
        courseId,
        courseTitle: course.title,
        unitPriceBrl: CERTIFICATE_ISSUANCE_FEE_BRL,
        userId: user.id,
        payerEmail: user.email,
        baseUrl,
      })

      const useSandbox = process.env.MERCADOPAGO_SANDBOX === 'true'
      const url =
        useSandbox && preference.sandbox_init_point
          ? preference.sandbox_init_point
          : preference.init_point

      return NextResponse.json({
        paymentRequired: true,
        url,
        provider: 'mercadopago',
        feeCents: CERTIFICATE_ISSUANCE_FEE_CENTS,
        feeLabel: formatCertificateFeeBrl(),
      })
    }

    if (isStripePaymentEnabled() && isStripeConfigured()) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim())
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: stripeCheckoutPaymentMethods(),
        customer_email: user.email,
        locale: 'pt-BR',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'brl',
              unit_amount: CERTIFICATE_ISSUANCE_FEE_CENTS,
              product_data: {
                name: `Certificado digital — ${course.title}`,
                description: `Taxa de emissão do certificado digital CONECT CURSOS (${formatCertificateFeeBrl()})`,
              },
            },
          },
        ],
        success_url: `${baseUrl}/courses/${courseId}?certificate=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/courses/${courseId}`,
        metadata: {
          userId: user.id,
          courseId,
          type: 'certificate',
        },
      })

      if (!checkoutSession.url) {
        return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
      }

      return NextResponse.json({
        paymentRequired: true,
        url: checkoutSession.url,
        provider: 'stripe',
        feeCents: CERTIFICATE_ISSUANCE_FEE_CENTS,
        feeLabel: formatCertificateFeeBrl(),
      })
    }

    return NextResponse.json(
      { error: 'Mercado Pago não configurado (MERCADOPAGO_ACCESS_TOKEN).' },
      { status: 503 }
    )
  } catch (e: unknown) {
    const auth = authErrorResponse(e)
    if (auth.status !== 500) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
