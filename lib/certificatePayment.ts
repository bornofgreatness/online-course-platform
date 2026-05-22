import type { PrismaClient } from './generated/prisma'
import { CERTIFICATE_ISSUANCE_FEE_CENTS, certificateFeeEnabled } from './certificatePolicy'

export const PAYMENT_PURPOSE_CERTIFICATE = 'certificate'

/** Record certificate fee payment (idempotent by Stripe session id). */
export async function recordCertificatePayment(
  prisma: PrismaClient,
  input: {
    userId: string
    courseId: string
    amountBrl: number
    externalId: string
    currency?: string
  }
) {
  const existing = await prisma.payment.findFirst({
    where: {
      provider: 'stripe',
      externalId: input.externalId,
      status: 'succeeded',
    },
  })
  if (existing) return existing

  return prisma.payment.create({
    data: {
      userId: input.userId,
      amount: input.amountBrl,
      currency: (input.currency || 'brl').toLowerCase(),
      status: 'succeeded',
      provider: 'stripe',
      externalId: input.externalId,
      stripeId: input.externalId,
      purpose: PAYMENT_PURPOSE_CERTIFICATE,
      courseId: input.courseId,
    },
  })
}

export async function hasPaidCertificateFee(
  prisma: PrismaClient,
  userId: string,
  courseId: string
): Promise<boolean> {
  if (!certificateFeeEnabled()) return true

  const minAmount = CERTIFICATE_ISSUANCE_FEE_CENTS / 100 - 0.01

  const paid = await prisma.payment.findFirst({
    where: {
      userId,
      courseId,
      purpose: PAYMENT_PURPOSE_CERTIFICATE,
      status: 'succeeded',
      amount: { gte: minAmount },
    },
    orderBy: { createdAt: 'desc' },
  })
  return !!paid
}

export function expectedCertificateFeeCents(): number {
  return CERTIFICATE_ISSUANCE_FEE_CENTS
}
