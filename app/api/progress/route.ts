import { NextResponse } from 'next/server'
import { authErrorResponse, requirePremiumAccess, requireSession } from '@/lib/auth/session'
import { isPrivilegedRole } from '@/lib/auth/rbac'
import { getPrisma } from '../../../lib/prisma'
import { touchLastViewed, parseCourseProgress } from '../../../lib/progress'

export async function POST(request: Request) {
  try {
    const { user } = await requireSession()

    const { courseId, progress } = await request.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 })
    }

    if (!isPrivilegedRole(user.role)) {
      await requirePremiumAccess()
    }

    if (progress?.completed === true && !isPrivilegedRole(user.role)) {
      const quiz = await prisma.quiz.findUnique({ where: { courseId } })
      if (quiz) {
        const passedAttempt = await prisma.quizAttempt.findFirst({
          where: { userId: user.id, quizId: quiz.id, passed: true },
        })
        if (!passedAttempt) {
          return NextResponse.json(
            { error: 'Pass the course quiz (7/10 or higher) before marking the course complete.' },
            { status: 400 }
          )
        }
      }
    }

    const current = parseCourseProgress(enrollment.progress)
    const incoming =
      typeof progress === 'object' && progress !== null
        ? (progress as { completed?: boolean; lastPage?: number })
        : {}
    const merged = touchLastViewed({
      completed: typeof incoming.completed === 'boolean' ? incoming.completed : current.completed,
      lastPage: typeof incoming.lastPage === 'number' ? incoming.lastPage : current.lastPage,
    })

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      data: {
        progress: JSON.stringify(merged),
      },
    })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
