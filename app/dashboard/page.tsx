'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'

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
      })
      .finally(() => setLoading(false))
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <PageShell>
          <p className={siteMutedClass}>Loading…</p>
        </PageShell>
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
      <PageShell>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={siteTitleClass}>Dashboard</h1>
            <p className={`${siteMutedClass} mt-2`}>Welcome back, {user.name ?? 'Learner'}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse courses
            </Link>
            <Link
              href="/certificates"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              My certificates
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Admin panel
              </Link>
            )}
          </div>
        </div>

        <div className={`${siteCardClass} p-5 sm:p-6`}>
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">Your enrolled courses</h2>
          {enrollments.length === 0 ? (
            <p className={siteMutedClass}>You have not enrolled in any courses yet.</p>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const progress = enrollment.progress ? JSON.parse(enrollment.progress) : { completed: false, lastPage: 0 }
                const progressPercent = progress.completed ? 100 : Math.min((progress.lastPage / 10) * 100, 90)

                return (
                  <div key={enrollment.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-lg font-bold text-blue-950">{enrollment.course.title}</h3>
                      <span
                        className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          progress.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {progress.completed ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Category: {enrollment.course.category.name}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{enrollment.course.description}</p>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                        <span>Progress</span>
                        <span className="tabular-nums font-medium">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Link href={`/courses/${enrollment.course.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        {progress.completed ? 'Review course' : 'Continue learning'}
                      </Link>
                      <span className="text-xs text-slate-500">Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PageShell>
    </>
  )
}
