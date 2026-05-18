import { NextResponse } from 'next/server'
import { authErrorResponse, requirePremiumAccess, requireSession } from '@/lib/auth/session'
import { getPrisma } from '../../../../../lib/prisma'
import {
  gradeAnswers,
  localizeQuizPayload,
  parseQuizQuestions,
  QUIZ_MAX_ATTEMPTS,
  QUIZ_PASS_SCORE,
  stripAnswers,
} from '../../../../../lib/quiz'

export const dynamic = 'force-dynamic'

async function loadQuizContext(courseId: string, userId: string) {
  await requirePremiumAccess()
  const prisma = getPrisma()

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment) {
    throw new Error('Not available')
  }

  const quiz = await prisma.quiz.findUnique({ where: { courseId } })
  return { prisma, enrollment, quiz }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireSession()
    const { prisma, enrollment, quiz } = await loadQuizContext(params.id, user.id)

    if (!enrollment) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 })
    }

    if (!quiz) {
      return NextResponse.json({ quiz: null })
    }

    const payload = parseQuizQuestions(quiz.questions)
    if (!payload) {
      return NextResponse.json({ error: 'Quiz misconfigured' }, { status: 500 })
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id, quizId: quiz.id },
      orderBy: { attemptedAt: 'desc' },
    })

    const language = new URL(request.url).searchParams.get('lang') === 'pt' ? 'pt' : 'en'

    return NextResponse.json({
      quiz: stripAnswers(localizeQuizPayload(payload, language)),
      attemptsUsed: attempts.length,
      maxAttempts: QUIZ_MAX_ATTEMPTS,
      bestScore: attempts.length ? Math.max(...attempts.map((a) => a.score)) : null,
      passed: attempts.some((a) => a.passed),
      history: attempts.map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        attemptedAt: a.attemptedAt,
      })),
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    const code = error === 'Not available' ? 403 : status
    return NextResponse.json({ error: error === 'Not available' ? 'Not available' : error }, { status: code })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { user } = await requireSession()
    const { prisma, enrollment, quiz } = await loadQuizContext(params.id, user.id)

    if (!enrollment) {
      return NextResponse.json({ error: 'Not available' }, { status: 403 })
    }

    if (!quiz) {
      return NextResponse.json({ error: 'No quiz for this course' }, { status: 404 })
    }

    const payload = parseQuizQuestions(quiz.questions)
    if (!payload) {
      return NextResponse.json({ error: 'Quiz misconfigured' }, { status: 500 })
    }

    const attemptCount = await prisma.quizAttempt.count({
      where: { userId: user.id, quizId: quiz.id },
    })
    if (attemptCount >= QUIZ_MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Maximum quiz attempts reached' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const answers = body?.answers as unknown
    if (!Array.isArray(answers) || answers.length !== payload.questions.length) {
      return NextResponse.json({ error: 'Invalid answers payload' }, { status: 400 })
    }

    const numericAnswers = answers.map((a) => (typeof a === 'number' ? a : Number.NaN))
    if (numericAnswers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)) {
      return NextResponse.json({ error: 'Each answer must be an integer 0–3' }, { status: 400 })
    }

    const score = gradeAnswers(payload, numericAnswers)
    const passed = score >= QUIZ_PASS_SCORE

    await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quiz.id,
        answers: JSON.stringify(numericAnswers),
        score,
        passed,
      },
    })

    const remaining = QUIZ_MAX_ATTEMPTS - attemptCount - 1

    return NextResponse.json({
      score,
      passed,
      passScore: QUIZ_PASS_SCORE,
      attemptsRemaining: Math.max(0, remaining),
    })
  } catch (e: unknown) {
    const { error, status } = authErrorResponse(e)
    const code = error === 'Not available' ? 403 : status
    return NextResponse.json({ error: error === 'Not available' ? 'Not available' : error }, { status: code })
  }
}
