import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { authErrorResponse } from '@/lib/auth/session'
import { getPrisma } from '@/lib/prisma'
import { buildDefaultQuizPayload, parseQuizQuestions } from '@/lib/quiz'

export async function GET() {
  try {
    await requireAdmin()
    const prisma = getPrisma()

    const [quizzes, courses] = await Promise.all([
      prisma.quiz.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { id: true, title: true, category: { select: { name: true } } } },
          _count: { select: { attempts: true } },
        },
      }),
      prisma.course.findMany({
        orderBy: { title: 'asc' },
        select: { id: true, title: true, category: { select: { name: true } } },
      }),
    ])

    const quizByCourseId = new Map(quizzes.map((q) => [q.courseId, q]))
    const coursesWithoutQuiz = courses.filter((c) => !quizByCourseId.has(c.id))

    return NextResponse.json({
      quizzes: quizzes.map((q) => ({
        id: q.id,
        courseId: q.courseId,
        courseTitle: q.course.title,
        categoryName: q.course.category.name,
        questionCount: parseQuizQuestions(q.questions)?.questions.length ?? 0,
        attemptCount: q._count.attempts,
        createdAt: q.createdAt,
        valid: !!parseQuizQuestions(q.questions),
      })),
      coursesWithoutQuiz,
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    const courseId = typeof body?.courseId === 'string' ? body.courseId : ''
    const questionsRaw = body?.questions

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const prisma = getPrisma()
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    let questionsJson: string
    if (questionsRaw !== undefined) {
      const payload =
        typeof questionsRaw === 'string'
          ? parseQuizQuestions(questionsRaw)
          : parseQuizQuestions(JSON.stringify(questionsRaw))
      if (!payload) {
        return NextResponse.json({ error: 'Invalid quiz: must have exactly 10 questions with 4 options each' }, { status: 400 })
      }
      questionsJson = JSON.stringify(payload)
    } else {
      questionsJson = JSON.stringify(buildDefaultQuizPayload())
    }

    const quiz = await prisma.quiz.upsert({
      where: { courseId },
      update: { questions: questionsJson },
      create: { courseId, questions: questionsJson },
    })

    return NextResponse.json({ quiz })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    return NextResponse.json({ error }, { status })
  }
}
