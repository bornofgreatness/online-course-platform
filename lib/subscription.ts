import type { PrismaClient, Subscription } from '@prisma/client'

export { isPrivilegedRole } from './auth/rbac'

export async function getActiveSubscription(prisma: PrismaClient, userId: string): Promise<Subscription | null> {
  const now = new Date()
  return prisma.subscription.findFirst({
    where: { userId, active: true, endDate: { gt: now } },
    orderBy: { endDate: 'desc' },
  })
}

export function subscriptionDaysRemaining(sub: Subscription | null) {
  if (!sub || !sub.active) return 0
  const ms = sub.endDate.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}
