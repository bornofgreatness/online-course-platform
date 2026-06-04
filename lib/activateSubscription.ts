import type { PrismaClient } from '@prisma/client'
import { addMonths, isBillingPlan, PLAN_LABEL_PT, PLAN_MONTHS, type BillingPlan } from './billingPlans'
import { sendEmail } from './email'

export type ActivateSubscriptionInput = {
  userId: string
  plan: string
  amountBrl: number
  currency?: string
  provider: 'stripe' | 'mercadopago'
  externalId: string
  couponId?: string | null
}

export async function activateSubscription(prisma: PrismaClient, input: ActivateSubscriptionInput) {
  if (!isBillingPlan(input.plan)) {
    throw new Error(`Invalid plan: ${input.plan}`)
  }

  const plan = input.plan as BillingPlan
  const months = PLAN_MONTHS[plan]

  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findFirst({
      where: { provider: input.provider, externalId: input.externalId, status: 'succeeded' },
    })
    if (existing) return

    await tx.subscription.updateMany({
      where: { userId: input.userId, active: true },
      data: { active: false },
    })

    const start = new Date()
    const end = addMonths(start, months)
    await tx.subscription.create({
      data: {
        userId: input.userId,
        plan,
        startDate: start,
        endDate: end,
        active: true,
      },
    })

    await tx.payment.create({
      data: {
        userId: input.userId,
        amount: input.amountBrl,
        currency: (input.currency || 'brl').toLowerCase(),
        status: 'succeeded',
        provider: input.provider,
        externalId: input.externalId,
        stripeId: input.provider === 'stripe' ? input.externalId : null,
        couponId: input.couponId || null,
      },
    })

    if (input.couponId) {
      await tx.coupon.update({
        where: { id: input.couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    const referral = await tx.referral.findFirst({
      where: { referredUserId: input.userId },
      orderBy: { createdAt: 'desc' },
    })
    if (referral && input.amountBrl > 0) {
      const commission = Math.round(input.amountBrl * 10) / 100
      if (commission > 0) {
        await tx.affiliateCommission.create({
          data: {
            affiliateId: referral.affiliateId,
            referredUserId: input.userId,
            amount: commission,
            status: 'PENDING',
          },
        })
      }
    }
  })

  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, name: true } })
  if (user?.email && isBillingPlan(input.plan)) {
    const planLabel = PLAN_LABEL_PT[input.plan as BillingPlan]
    const end = addMonths(new Date(), PLAN_MONTHS[input.plan as BillingPlan])
    void sendEmail({
      to: user.email,
      subject: 'Pagamento confirmado — Plataforma de Cursos',
      html: `
        <p>Olá ${user.name || ''},</p>
        <p>Seu pagamento foi confirmado. Sua assinatura <strong>${planLabel}</strong> está ativa até
        <strong>${end.toLocaleDateString('pt-BR')}</strong>.</p>
        <p>Valor: R$ ${input.amountBrl.toFixed(2).replace('.', ',')}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard">Acessar o painel</a></p>
      `,
    })
  }
}
