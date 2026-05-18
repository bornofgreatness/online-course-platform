import { NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/admin'
import { authErrorResponse } from '@/lib/auth/session'
import {
  assignableRoles,
  canAssignRole,
  canDeleteUser,
  canManageRoles,
  isSuperAdminRole,
  normalizeRole,
  ROLES,
} from '@/lib/auth/rbac'
import { getPrisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { user: actor } = await requireAdmin()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || '1') || 1)
    const pageSizeRaw = Math.max(1, Number(searchParams.get('pageSize') || '25') || 25)
    const pageSize = Math.min(100, pageSizeRaw)
    const search = (searchParams.get('search') || '').trim()

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { whatsapp: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { state: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const prisma = getPrisma()
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          whatsapp: true,
          address: true,
          city: true,
          state: true,
          role: true,
          emailVerifiedAt: true,
          createdAt: true,
          affiliate: { select: { id: true } },
          _count: {
            select: {
              enrollments: true,
              subscriptions: true,
              payments: true,
              certificates: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      page,
      pageSize,
      total,
      assignableRoles: assignableRoles(actor.role),
      canManageRoles: canManageRoles(actor.role),
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const { user: actor } = await requireAdmin()

    const body = await request.json()
    const { id, role } = body as { id?: string; role?: string }

    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
    }

    const normalizedRole = normalizeRole(role)
    if (!normalizedRole) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (normalizedRole === ROLES.SUPER_ADMIN) {
      await requireSuperAdmin()
    }

    const prisma = getPrisma()
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (isSuperAdminRole(target.role)) {
      await requireSuperAdmin()
    }

    if (!canAssignRole(actor.role, target.role, normalizedRole)) {
      return NextResponse.json({ error: 'You cannot assign this role' }, { status: 403 })
    }

    if (target.id === actor.id && normalizedRole !== ROLES.SUPER_ADMIN && isSuperAdmin(actor)) {
      return NextResponse.json({ error: 'Super admins cannot demote themselves' }, { status: 403 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: normalizedRole },
    })

    return NextResponse.json({ user })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

function isSuperAdmin(user: { role: string }) {
  return normalizeRole(user.role) === ROLES.SUPER_ADMIN
}

export async function DELETE(request: Request) {
  try {
    const { user: actor } = await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (id === actor.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 403 })
    }

    const prisma = getPrisma()
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!canDeleteUser(actor.role, target.role)) {
      return NextResponse.json({ error: 'You cannot delete this user' }, { status: 403 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
