import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { authErrorResponse } from '@/lib/auth/session'
import { getPrisma } from '@/lib/prisma'
import { buildDefaultQuizPayload, parseQuizQuestions } from '@/lib/quiz'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const prisma = getPrisma()

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { course: { select: { id: true, title: true } } },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const payload = parseQuizQuestions(quiz.questions)
    return NextResponse.json({
      quiz: {
        id: quiz.id,
        courseId: quiz.courseId,
        courseTitle: quiz.course.title,
        questions: payload?.questions ?? null,
        valid: !!payload,
      },
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const prisma = getPrisma()

    const existing = await prisma.quiz.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    let questionsJson: string
    if (body?.useDefault === true) {
      questionsJson = JSON.stringify(buildDefaultQuizPayload())
    } else {
      const questionsRaw = body?.questions
      const payload =
        typeof questionsRaw === 'string'
          ? parseQuizQuestions(questionsRaw)
          : parseQuizQuestions(JSON.stringify(questionsRaw))
      if (!payload) {
        return NextResponse.json({ error: 'Invalid quiz: must have exactly 10 questions with 4 options each' }, { status: 400 })
      }
      questionsJson = JSON.stringify(payload)
    }

    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: { questions: questionsJson },
    })

    return NextResponse.json({ quiz })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const prisma = getPrisma()

    const existing = await prisma.quiz.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    await prisma.quizAttempt.deleteMany({ where: { quizId: params.id } })
    await prisma.quiz.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
