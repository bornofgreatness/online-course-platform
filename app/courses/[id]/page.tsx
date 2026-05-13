import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../../components/PageShell'
import PDFViewer from '../../../components/PDFViewer'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/options'
import CourseActions from '../../../components/CourseActions'

interface Props {
  params: {
    id: string
  }
}

export default async function CourseDetails({ params }: Props) {
  const session = await getServerSession(authOptions)
  const prisma = getPrisma()

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!course) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>Course not found.</p>
          <Link href="/courses" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Back to courses
          </Link>
        </PageShell>
      </>
    )
  }

  let enrollment: any = null
  let progress = { completed: false, lastPage: 0 }
  let certificate: any = null

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    if (user) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: params.id,
          },
        },
      })

      if (enrollment?.progress) {
        progress = JSON.parse(enrollment.progress)
      }

      certificate = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: params.id,
          },
        },
      })
    }
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{course.category.name}</p>
            <h1 className={`${siteTitleClass} mt-2`}>{course.title}</h1>
          </div>

          <Link href="/courses" className="shrink-0 text-sm font-semibold text-blue-600 hover:underline">
            Back to all courses
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">About this course</h2>
              <p className="text-slate-700">{course.description}</p>
              <p className={`${siteMutedClass} mt-4`}>Workload: {course.workloadHours} hours</p>
              <div className="mt-4 whitespace-pre-line text-slate-700">{course.syllabus}</div>
            </div>

            {enrollment && course.pdfUrl && (
              <PDFViewer
                url={course.pdfUrl}
                title={`${course.title} - Course Material`}
                courseId={course.id}
                initialProgress={progress}
              />
            )}
          </div>

          <aside className="space-y-6">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <div>
                <p className={`${siteMutedClass} text-xs uppercase tracking-wide`}>Instructor</p>
                <h3 className="mt-1 text-lg font-bold text-blue-950">PDF Learning Team</h3>
              </div>
              <div className="mt-4">
                <p className={`${siteMutedClass} text-xs uppercase tracking-wide`}>SEO title</p>
                <p className="text-slate-800">{course.seoTitle ?? 'PDF Learning Course'}</p>
              </div>
              <div className="mt-6">
                <CourseActions
                  courseId={course.id}
                  isEnrolled={!!enrollment}
                  progress={progress}
                  hasCertificate={!!certificate}
                />
              </div>
            </div>

            {course.thumbnailUrl && (
              <div className={`${siteCardClass} p-5 sm:p-6`}>
                <h3 className="mb-3 text-lg font-bold text-blue-950">Course preview</h3>
                <img src={course.thumbnailUrl} alt={course.title} className="h-48 w-full rounded-lg object-cover" />
              </div>
            )}
          </aside>
        </div>
      </PageShell>
    </>
  )
}
