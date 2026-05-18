/**
 * Role-based access control for the platform.
 *
 * VISITOR is implicit (unauthenticated) and is not stored in the database.
 * AFFILIATE capability is determined by the Affiliate table; User.role may
 * still be AFFILIATE for legacy rows but must not be relied on alone.
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  AFFILIATE: 'AFFILIATE',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type DbRole = (typeof ROLES)[keyof typeof ROLES]

const VALID_ROLES = new Set<string>(Object.values(ROLES))

export function normalizeRole(role: string | null | undefined): DbRole | null {
  const r = (role ?? '').toString().trim().toUpperCase()
  return VALID_ROLES.has(r) ? (r as DbRole) : null
}

export function isAdminRole(role: string | null | undefined): boolean {
  const r = normalizeRole(role)
  return r === ROLES.ADMIN || r === ROLES.SUPER_ADMIN
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === ROLES.SUPER_ADMIN
}

/** Admins bypass subscription checks for premium content. */
export function isPrivilegedRole(role: string | null | undefined): boolean {
  return isAdminRole(role)
}

export function canAccessAdminPanel(role: string | null | undefined): boolean {
  return isAdminRole(role)
}

export function canAccessDashboard(isAuthenticated: boolean): boolean {
  return isAuthenticated
}

/** Premium course content (PDFs, quizzes, enroll, progress). */
export function canAccessPremiumContent(
  role: string | null | undefined,
  hasActiveSubscription: boolean
): boolean {
  return isPrivilegedRole(role) || hasActiveSubscription
}

export function canDownloadCertificates(
  role: string | null | undefined,
  hasActiveSubscription: boolean
): boolean {
  return canAccessPremiumContent(role, hasActiveSubscription)
}

export function canManageSubscription(isAuthenticated: boolean): boolean {
  return isAuthenticated
}

export function canAccessAffiliateDashboard(
  isAuthenticated: boolean,
  hasAffiliateAccount: boolean
): boolean {
  return isAuthenticated && hasAffiliateAccount
}

export function canRegisterAsAffiliate(role: string | null | undefined): boolean {
  return !isAdminRole(role)
}

/** Both ADMIN and SUPER_ADMIN can access all standard admin operations. */
export function canPerformAdminOperations(role: string | null | undefined): boolean {
  return isAdminRole(role)
}

/** Roles an actor may assign via admin user management. */
export function assignableRoles(actorRole: string | null | undefined): DbRole[] {
  if (isSuperAdminRole(actorRole)) {
    return [ROLES.STUDENT, ROLES.AFFILIATE, ROLES.ADMIN, ROLES.SUPER_ADMIN]
  }
  if (normalizeRole(actorRole) === ROLES.ADMIN) {
    return [ROLES.STUDENT, ROLES.AFFILIATE, ROLES.ADMIN]
  }
  return []
}

export function canAssignRole(
  actorRole: string | null | undefined,
  targetCurrentRole: string | null | undefined,
  newRole: string | null | undefined
): boolean {
  const normalizedNew = normalizeRole(newRole)
  if (!normalizedNew) return false

  const assignable = assignableRoles(actorRole)
  if (!assignable.includes(normalizedNew)) return false

  const target = normalizeRole(targetCurrentRole)
  if (isSuperAdminRole(target) || normalizeRole(targetCurrentRole) === ROLES.ADMIN) {
    return isSuperAdminRole(actorRole)
  }

  return true
}

export function canDeleteUser(
  actorRole: string | null | undefined,
  targetRole: string | null | undefined
): boolean {
  const target = normalizeRole(targetRole)
  if (target === ROLES.SUPER_ADMIN || target === ROLES.ADMIN) {
    return isSuperAdminRole(actorRole)
  }
  return isAdminRole(actorRole)
}

export function canManageRoles(actorRole: string | null | undefined): boolean {
  return isSuperAdminRole(actorRole)
}
