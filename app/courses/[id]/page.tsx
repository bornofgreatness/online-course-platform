import { getPrisma } from '../../../lib/prisma'
import Link from 'next/link'
import Header from '../../../components/Header'
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
    include: { category: true }
  })

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen p-8">
          <p>Course not found.</p>
          <Link href="/courses" className="text-blue-500 hover:underline">
            Back to courses
          </Link>
        </main>
      </>
    )
  }

  // Check enrollment and progress
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
            courseId: params.id
          }
        }
      })

      if (enrollment?.progress) {
        progress = JSON.parse(enrollment.progress)
      }

      certificate = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: params.id
          }
        }
      })
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{course.category.name}</p>
            <h1 className="text-4xl font-bold mt-2">{course.title}</h1>
          </div>

          <Link href="/courses" className="text-blue-500 hover:underline">
            Back to all courses
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border p-6 shadow-sm bg-white">
              <h2 className="text-2xl font-semibold mb-3">About this course</h2>
              <p className="text-gray-700">{course.description}</p>
              <p className="mt-4 text-sm text-gray-500">Workload: {course.workloadHours} hours</p>
              <div className="mt-4 whitespace-pre-line text-gray-700">{course.syllabus}</div>
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
            <div className="rounded-xl border p-6 shadow-sm bg-white">
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <h3 className="text-xl font-semibold">PDF Learning Team</h3>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">SEO title</p>
                <p>{course.seoTitle ?? 'PDF Learning Course'}</p>
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
              <div className="rounded-xl border p-6 shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">Course Preview</h3>
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

