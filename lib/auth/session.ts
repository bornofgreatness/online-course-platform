import { getServerSession } from 'next-auth'
import type { User } from '@prisma/client'
import { authOptions } from '../../app/api/auth/[...nextauth]/options'
import { getPrisma } from '../prisma'
import {
  canAccessPremiumContent,
  isAdminRole,
  isSuperAdminRole,
  normalizeRole,
} from './rbac'
import { getActiveSubscription } from '../subscription'

export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export type AuthenticatedUser = User & {
  roleNormalized: ReturnType<typeof normalizeRole>
}

export async function requireSession(): Promise<{
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>
  user: AuthenticatedUser
}> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new AuthError('Authentication required', 401)
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    throw new AuthError('User not found', 404)
  }

  return {
    session,
    user: { ...user, roleNormalized: normalizeRole(user.role) },
  }
}

export async function requireAdmin() {
  const { session, user } = await requireSession()
  if (!isAdminRole(user.role)) {
    throw new AuthError('Forbidden', 403)
  }
  return { session, user, role: user.roleNormalized! }
}

export async function requireSuperAdmin() {
  const { session, user } = await requireSession()
  if (!isSuperAdminRole(user.role)) {
    throw new AuthError('Forbidden — super admin required', 403)
  }
  return { session, user, role: user.roleNormalized! }
}

/** Student premium content: active subscription or admin bypass. */
export async function requirePremiumAccess() {
  const { session, user } = await requireSession()
  const prisma = getPrisma()
  const sub = await getActiveSubscription(prisma, user.id)
  const hasAccess = canAccessPremiumContent(user.role, !!sub)
  if (!hasAccess) {
    throw new AuthError(
      'An active subscription is required. Visit pricing to subscribe.',
      403
    )
  }
  return { session, user, subscription: sub }
}

export async function requireAffiliateAccount() {
  const { session, user } = await requireSession()
  const prisma = getPrisma()
  const affiliate = await prisma.affiliate.findUnique({ where: { userId: user.id } })
  if (!affiliate) {
    throw new AuthError('Affiliate account required', 403)
  }
  return { session, user, affiliate }
}

export function authErrorResponse(e: unknown) {
  if (e instanceof AuthError) {
    return { error: e.message, status: e.statusCode }
  }
  const err = e as { message?: string; statusCode?: number }
  return { error: err?.message || 'Forbidden', status: err?.statusCode || 403 }
}
