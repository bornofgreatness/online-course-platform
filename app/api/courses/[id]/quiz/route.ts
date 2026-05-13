import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/options'
import { getPrisma } from '../../../../../lib/prisma'
import { getActiveSubscription, isPrivilegedRole } from '../../../../../lib/subscription'
import {
  gradeAnswers,
  localizeQuizPayload,
  parseQuizQuestions,
  QUIZ_MAX_ATTEMPTS,
  QUIZ_PASS_SCORE,
  stripAnswers,
} from '../../../../../lib/quiz'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const role = (user.role ?? '').toString()
  const sub = await getActiveSubscription(prisma, user.id)
  const hasAccess = isPrivilegedRole(role) || !!sub

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: params.id } },
  })
  if (!enrollment || !hasAccess) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const quiz = await prisma.quiz.findUnique({ where: { courseId: params.id } })
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
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const role = (user.role ?? '').toString()
  const sub = await getActiveSubscription(prisma, user.id)
  const hasAccess = isPrivilegedRole(role) || !!sub

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: params.id } },
  })
  if (!enrollment || !hasAccess) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const quiz = await prisma.quiz.findUnique({ where: { courseId: params.id } })
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
}
