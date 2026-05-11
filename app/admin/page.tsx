import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/options'
import { getPrisma } from '../../lib/prisma'
import Link from 'next/link'
import Header from '../../components/Header'

export default async function AdminPage() {

  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <>
        <Header />
        <div className="min-h-screen p-8">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
          <div className="mt-6">
            <Link href="/" className="text-blue-500 hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </>
    )
  }

  const prisma = getPrisma()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const courses = await prisma.course.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Back to home
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Total Courses</h2>
            <p className="text-3xl font-bold text-green-600">{courses.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Total Enrollments</h2>
            <p className="text-3xl font-bold text-purple-600">{enrollments.length}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course: any) => (
                <div
                  key={course.id}
                  className="py-2 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-500">
                    {course.category.name} • {course.workloadHours}h
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Enrollments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Course</th>
                  <th className="text-left py-2">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 10).map((enrollment: any) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="py-2">{enrollment.user.name}</td>
                    <td className="py-2">{enrollment.course.title}</td>
                    <td className="py-2">
                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

