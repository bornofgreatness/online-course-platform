import { NextResponse } from 'next/server'
import { authErrorResponse, requirePremiumAccess } from '@/lib/auth/session'
import { getPrisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const { user } = await requirePremiumAccess()

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const prisma = getPrisma()

    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 409 })
    }

    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progress: JSON.stringify({ completed: false, lastPage: 0 }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
