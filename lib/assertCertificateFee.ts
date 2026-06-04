import type { PrismaClient } from '@prisma/client'
import { CERTIFICATE_ISSUANCE_FEE_BRL, certificateFeeEnabled } from './certificatePolicy'
import { hasPaidCertificateFee } from './certificatePayment'
import { isPrivilegedRole } from './auth/rbac'

export function certificateFeeWaivedForRole(role: string | null | undefined): boolean {
  return (
    process.env.CERTIFICATE_FEE_WAIVE_ADMIN === 'true' && isPrivilegedRole(role)
  )
}

export function isCertificateFeeRequired(role: string | null | undefined): boolean {
  return certificateFeeEnabled() && !certificateFeeWaivedForRole(role)
}

/** Throws a plain object `{ message, status, paymentRequired }` for API routes. */
export async function assertCertificateFeePaid(
  prisma: PrismaClient,
  userId: string,
  courseId: string,
  role: string | null | undefined
): Promise<void> {
  if (!isCertificateFeeRequired(role)) return

  const paid = await hasPaidCertificateFee(prisma, userId, courseId)
  if (!paid) {
    throw {
      message: 'Certificate issuance fee not paid',
      status: 402,
      paymentRequired: true,
    }
  }
}

export function certificatePaymentRequiredResponse() {
  return {
    error: 'Certificate issuance fee not paid',
    paymentRequired: true,
    feeBrl: CERTIFICATE_ISSUANCE_FEE_BRL,
    checkoutEndpoint: '/api/billing/certificate-checkout',
  }
}
