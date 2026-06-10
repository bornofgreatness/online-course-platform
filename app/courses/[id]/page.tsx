import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import PDFViewer from '../../../components/PDFViewer'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/options'
import CourseActionsPanel from '../../../components/CourseActionsPanel'
import CourseQuizPanel from '../../../components/CourseQuizPanel'
import { LocalizedText } from '../../../components/LanguageProvider'
import { getActiveSubscription } from '../../../lib/subscription'
import { canAccessPremiumContent } from '../../../lib/auth/rbac'
import type { Metadata } from 'next'
import { courseJsonLd } from '../../../lib/structuredData'
import { SITE_NAME } from '../../../lib/seo/metadata'
import { SEO_KEYWORDS_COMBINED_STRING } from '../../../lib/seo/keywords'
import { parseCourseProgress } from '../../../lib/progress'
import type { Category, Course } from '@prisma/client'

interface Props {
  params: { id: string }
}

type CourseWithCategory = Course & { category: Category | null }

function logCoursePageError(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[course/${label}]`, message, error)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!process.env.DATABASE_URL) {
    return { title: 'Course' }
  }
  try {
    const prisma = getPrisma()
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
    if (!course) return { title: 'Course not found' }
    const descriptionText = course.description?.trim() || course.title
    const title =
      course.seoTitle || `${course.title} — curso online com certificado | ${SITE_NAME}`
    const description =
      course.seoDescription ||
      `${descriptionText.slice(0, 140)}… Curso EaD com certificado digital. ${course.workloadHours}h.`
    return {
      title,
      description,
      keywords: SEO_KEYWORDS_COMBINED_STRING,
      openGraph: {
        title,
        description,
        type: 'article',
        images: course.thumbnailUrl ? [{ url: course.thumbnailUrl }] : undefined,
      },
    }
  } catch (error) {
    logCoursePageError('metadata', error)
    return { title: 'Course' }
  }
}

export default async function CourseDetails({ params }: Props) {
  let session: Awaited<ReturnType<typeof getServerSession<typeof authOptions>>> = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    logCoursePageError('session', error)
  }

  let course: CourseWithCategory | null = null
  try {
    const prisma = getPrisma()
    course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
  } catch (error) {
    logCoursePageError('course', error)
    throw error
  }

  if (!course) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>
            <LocalizedText textKey="common.courseNotFound" />
          </p>
          <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            <LocalizedText textKey="common.backToCourses" />
          </Link>
        </PageShell>
      </>
    )
  }

  let enrollment: { progress: string | null } | null = null
  let progress = { completed: false, lastPage: 0 }
  let certificate: { id: string } | null = null
  let hasAccess = false
  let quizRecord: { id: string } | null = null
  let quizPassed = false

  if (session?.user?.email) {
    try {
      const prisma = getPrisma()
      const u = await prisma.user.findUnique({ where: { email: session.user.email } })

      if (u) {
        const role = u.role ?? ''
        const sub = await getActiveSubscription(prisma, u.id)
        hasAccess = canAccessPremiumContent(role, !!sub)

        enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: u.id,
              courseId: params.id,
            },
          },
        })

        if (enrollment?.progress) {
          progress = parseCourseProgress(enrollment.progress)
        }

        try {
          certificate = await prisma.certificate.findUnique({
            where: {
              userId_courseId: {
                userId: u.id,
                courseId: params.id,
              },
            },
            select: { id: true },
          })
        } catch (error) {
          logCoursePageError('certificate', error)
        }

        try {
          const q = await prisma.quiz.findUnique({ where: { courseId: params.id } })
          if (q) {
            quizRecord = { id: q.id }
            const passedAttempt = await prisma.quizAttempt.findFirst({
              where: { userId: u.id, quizId: q.id, passed: true },
            })
            quizPassed = !!passedAttempt
          }
        } catch (error) {
          logCoursePageError('quiz', error)
        }
      }
    } catch (error) {
      logCoursePageError('user-context', error)
    }
  }

  const canViewPdf = !!enrollment && hasAccess
  const showQuizPanel = !!enrollment && hasAccess && !!quizRecord
  const securePdfUrl = canViewPdf ? `/api/courses/${course.id}/pdf` : ''
  const categoryName = course.category?.name ?? ''

  const jsonLd = courseJsonLd({
    id: course.id,
    title: course.title,
    description: course.description,
    workloadHours: course.workloadHours,
    thumbnailUrl: course.thumbnailUrl,
    categoryName,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <PageShell>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {categoryName ? (
              <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{categoryName}</p>
            ) : null}
            <h1 className={`${siteTitleClass} mt-2`}>{course.title}</h1>
          </div>

          <Link href="/courses" className="shrink-0 text-sm font-semibold text-blue-600 hover:underline">
            <LocalizedText textKey="common.backToAllCourses" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">
                <LocalizedText textKey="course.about" />
              </h2>
              <p className="text-slate-700">{course.description}</p>
              <p className={`${siteMutedClass} mt-4`}>
                <LocalizedText textKey="course.workload" values={{ hours: course.workloadHours }} />
              </p>
              {course.syllabus ? (
                <div className="mt-4 whitespace-pre-line text-slate-700">{course.syllabus}</div>
              ) : null}
            </div>

            {showQuizPanel ? <CourseQuizPanel courseId={course.id} /> : null}

            {enrollment && course.pdfUrl && canViewPdf ? (
              <PDFViewer
                url={securePdfUrl}
                title={course.title}
                courseId={course.id}
                initialProgress={progress}
              />
            ) : null}

            {enrollment && course.pdfUrl && !canViewPdf ? (
              <div className={`${siteCardClass} border-amber-200 bg-amber-50 p-5 text-sm text-amber-950`}>
                <p className="font-semibold">
                  <LocalizedText textKey="course.courseMaterialsLocked" />
                </p>
                <p className="mt-2 text-amber-900/90">
                  <LocalizedText textKey="course.renewPdfAccess" />
                </p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <div>
                <p className={`${siteMutedClass} text-xs uppercase tracking-wide`}>
                  <LocalizedText textKey="course.instructor" />
                </p>
                <h3 className="mt-1 text-lg font-bold text-blue-950">PDF Learning Team</h3>
              </div>
              <div className="mt-6">
                <CourseActionsPanel
                  courseId={course.id}
                  isEnrolled={!!enrollment}
                  subscriptionBlocked={!!enrollment && !hasAccess}
                  progress={progress}
                  hasCertificate={!!certificate}
                  quizExists={!!quizRecord}
                  quizPassed={quizPassed}
                />
              </div>
            </div>

            {course.thumbnailUrl ? (
              <div className={`${siteCardClass} p-5 sm:p-6`}>
                <h3 className="mb-3 text-lg font-bold text-blue-950">
                  <LocalizedText textKey="course.coursePreview" />
                </h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.thumbnailUrl} alt={course.title} className="h-48 w-full rounded-lg object-cover" />
              </div>
            ) : null}
          </aside>
        </div>
      </PageShell>
    </>
  )
}

export const dynamic = 'force-dynamic'
