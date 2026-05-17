import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const prisma = getPrisma()
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Forbidden' }, { status: e?.statusCode || 403 })
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { id, active } = body as { id?: string; active?: boolean }

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Subscription ID and active status are required' }, { status: 400 })
    }

    const prisma = getPrisma()
    const subscription = await prisma.subscription.update({
      where: { id },
      data: { active },
    })

    return NextResponse.json({ subscription })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update subscription' }, { status: e?.statusCode || 500 })
  }
}
