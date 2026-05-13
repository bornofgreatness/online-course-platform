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

interface Subscription {
  id: string
  plan: string
  startDate: string
  endDate: string
  active: boolean
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

interface CertificateRow {
  id: string
  certificateNumber: string
  issuedAt: string
  course: { title: string }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [completionPercent, setCompletionPercent] = useState(0)
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
        setSubscriptions(data.subscriptions || [])
        setActiveSubscription(data.activeSubscription || null)
        setPayments(data.payments || [])
        setCertificates(data.certificates || [])
        setCompletionPercent(typeof data.completionPercent === 'number' ? data.completionPercent : 0)
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

  const continueCourse = enrollments[0]

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
              href="/pricing"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Subscription
            </Link>
            <Link
              href="/affiliate"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Affiliate
            </Link>
            <Link
              href="/certificates"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Certificates
            </Link>
            {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
              <Link
                href="/admin"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Subscription</p>
            {activeSubscription ? (
              <>
                <p className="mt-2 text-lg font-bold text-slate-900">{activeSubscription.plan}</p>
                <p className="text-xs text-slate-600">
                  Renews / ends {new Date(activeSubscription.endDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-800">No active plan — enroll after subscribing.</p>
            )}
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Course completion</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{completionPercent}%</p>
            <p className="text-xs text-slate-600">Across enrolled courses</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Certificates</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{certificates.length}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">Payments</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{payments.length}</p>
          </div>
        </div>

        {continueCourse ? (
          <div className={`${siteCardClass} mb-6 p-5`}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">Continue learning</h2>
            <p className="mt-1 text-lg font-bold text-blue-950">{continueCourse.course.title}</p>
            <Link href={`/courses/${continueCourse.course.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
              Open course →
            </Link>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${siteCardClass} p-5 sm:p-6`}>
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">Enrolled courses</h2>
            {enrollments.length === 0 ? (
              <p className={siteMutedClass}>You have not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  let progress = { completed: false, lastPage: 0 }
                  try {
                    progress = enrollment.progress ? JSON.parse(enrollment.progress) : progress
                  } catch {
                    /* ignore */
                  }
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
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">{enrollment.course.description}</p>

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

          <div className="space-y-6">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">Payment history</h2>
              {payments.length === 0 ? (
                <p className={siteMutedClass}>No payments yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {payments.slice(0, 12).map((p) => (
                    <li key={p.id} className="flex justify-between py-2">
                      <span className="text-slate-600">{new Date(p.createdAt).toLocaleString()}</span>
                      <span className="font-medium tabular-nums">
                        ${p.amount.toFixed(2)} {p.currency?.toUpperCase()}
                      </span>
                      <span className="text-xs uppercase text-slate-500">{p.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">Subscription history</h2>
              {subscriptions.length === 0 ? (
                <p className={siteMutedClass}>No subscriptions yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {subscriptions.slice(0, 8).map((s) => (
                    <li key={s.id} className="flex flex-col py-2">
                      <span className="font-medium text-slate-900">
                        {s.plan} {s.active ? '(active)' : ''}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">Certificates</h2>
              {certificates.length === 0 ? (
                <p className={siteMutedClass}>No certificates yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {certificates.map((c) => (
                    <li key={c.id} className="flex flex-col rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                      <span className="font-semibold text-blue-950">{c.course.title}</span>
                      <span className="font-mono text-xs text-slate-600">{c.certificateNumber}</span>
                      <Link
                        href={`/verify/certificate/${encodeURIComponent(c.certificateNumber)}`}
                        className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Verify publicly
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    </>
  )
}
