'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

interface Enrollment {
  id: string
  enrolledAt: string
  progress: string | null
  course: {
    id: string
    title: string
    description: string
    category: { name: string }
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [completionPercent, setCompletionPercent] = useState<number>(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetch('/api/dashboard')
.then((res) => res.json())
      .then((data) => {
        setEnrollments(data.enrollments || [])
        setActiveSubscription(data.activeSubscription || null)
        setPayments(data.payments || [])
        setCertificates(data.certificates || [])
        setCompletionPercent(data.completionPercent || 0)
      })
      .finally(() => setLoading(false))
  }, [session, status, router])


  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen p-8">Loading...</div>
      </>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user as {
    name?: string | null
    email?: string | null
    role?: string
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name ?? 'Learner'}.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/courses" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Browse Courses
          </Link>
          <Link href="/certificates" className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
            My Certificates
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Your enrolled courses</h2>
        {enrollments.length === 0 ? (
          <p className="text-gray-600">You have not enrolled in any courses yet.</p>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const progress = enrollment.progress ? JSON.parse(enrollment.progress) : { completed: false, lastPage: 0 }
              const progressPercent = progress.completed ? 100 : Math.min((progress.lastPage / 10) * 100, 90) // Assuming 10 pages per course

              return (
                <div key={enrollment.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{enrollment.course.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      progress.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {progress.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Category: {enrollment.course.category.name}</p>
                  <p className="mt-2 text-gray-700">{enrollment.course.description}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Link href={`/courses/${enrollment.course.id}`} className="text-blue-500 hover:underline">
                      {progress.completed ? 'Review Course' : 'Continue Learning'}
                    </Link>
                    <span className="text-sm text-gray-500">Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
