'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../../components/PageShell'
import { useI18n } from '../../components/LanguageProvider'
import { parseCourseProgress } from '../../lib/progress'
import { canAccessAdminPanel } from '../../lib/auth/rbac'

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

function DashboardContent() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [certificates, setCertificates] = useState<CertificateRow[]>([])
  const [completionPercent, setCompletionPercent] = useState(0)
  const [recentlyViewed, setRecentlyViewed] = useState<
    Array<{ courseId: string; title: string; lastViewedAt?: string }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const checkout = searchParams.get('checkout')

    async function run() {
      if (checkout === 'success') {
        setCheckoutMessage(t('dashboard.paymentConfirmed'))
        router.replace('/dashboard', { scroll: false })
      } else if (checkout === 'pending') {
        setCheckoutMessage(t('dashboard.paymentPending'))
        router.replace('/dashboard', { scroll: false })
      }

      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setEnrollments(data.enrollments || [])
      setSubscriptions(data.subscriptions || [])
      setActiveSubscription(data.activeSubscription || null)
      setPayments(data.payments || [])
      setCertificates(data.certificates || [])
      setCompletionPercent(typeof data.completionPercent === 'number' ? data.completionPercent : 0)
      setRecentlyViewed(Array.isArray(data.recentlyViewed) ? data.recentlyViewed : [])
      setLoading(false)
    }

    void run()
  }, [session, status, router, searchParams, t])

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
  const recentAside = recentlyViewed.filter((r) => r.courseId !== continueCourse?.course.id)

  return (
    <>
      <Header />
      <PageShell>
        {checkoutMessage ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            {checkoutMessage}
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={siteTitleClass}>{t('common.dashboard')}</h1>
            <p className={`${siteMutedClass} mt-2`}>{t('common.welcomeBack')}, {user.name ?? 'Learner'}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t('common.browseCourses')}
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {t('common.subscription')}
            </Link>
            <Link
              href="/affiliate"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {t('common.affiliate')}
            </Link>
            <Link
              href="/certificates"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {t('common.certificates')}
            </Link>
            {canAccessAdminPanel(user.role) ? (
              <Link
                href="/admin"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                {t('common.admin')}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('common.subscription')}</p>
            {activeSubscription ? (
              <>
                <p className="mt-2 text-lg font-bold text-slate-900">{activeSubscription.plan}</p>
                <p className="text-xs text-slate-600">
                  {t('common.renewsEnds')} {new Date(activeSubscription.endDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-amber-800">{t('common.noActivePlan')}</p>
            )}
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('common.courseCompletion')}</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{completionPercent}%</p>
            <p className="text-xs text-slate-600">{t('common.acrossEnrolledCourses')}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('common.certificates')}</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{certificates.length}</p>
          </div>
          <div className={`${siteCardClass} p-4`}>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('common.payments')}</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-slate-900">{payments.length}</p>
          </div>
        </div>

        {recentAside.length > 0 ? (
          <div className={`${siteCardClass} mb-6 p-5`}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">{t('common.recentlyViewed')}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {recentAside.map((r) => (
                <li key={r.courseId}>
                  <Link href={`/courses/${r.courseId}`} className="font-semibold text-blue-600 hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {continueCourse ? (
          <div className={`${siteCardClass} mb-6 p-5`}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">{t('common.continueLearning')}</h2>
            <p className="mt-1 text-lg font-bold text-blue-950">{continueCourse.course.title}</p>
            <Link href={`/courses/${continueCourse.course.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
              {t('common.openCourse')}
            </Link>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${siteCardClass} p-5 sm:p-6`}>
            <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-blue-900 sm:text-xl">{t('common.enrolledCourses')}</h2>
            {enrollments.length === 0 ? (
              <p className={siteMutedClass}>{t('common.noEnrollments')}</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const progress = parseCourseProgress(enrollment.progress)
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
                          {progress.completed ? t('common.completed') : t('common.inProgress')}
                        </span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('common.category')}: {enrollment.course.category.name}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">{enrollment.course.description}</p>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                          <span>{t('common.progress')}</span>
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
                          {progress.completed ? t('common.reviewCourse') : t('common.continueLearning')}
                        </Link>
                        <span className="text-xs text-slate-500">{t('common.enrolled')} {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">{t('common.paymentHistory')}</h2>
              {payments.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noPayments')}</p>
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
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">{t('common.subscriptionHistory')}</h2>
              {subscriptions.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noSubscriptions')}</p>
              ) : (
                <ul className="divide-y divide-slate-100 text-sm">
                  {subscriptions.slice(0, 8).map((s) => (
                    <li key={s.id} className="flex flex-col py-2">
                      <span className="font-medium text-slate-900">
                        {s.plan} {s.active ? `(${t('common.active')})` : ''}
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
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide text-blue-900">{t('common.certificates')}</h2>
              {certificates.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noCertificates')}</p>
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
                        {t('common.verifyPublicly')}
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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <PageShell>
            <p className={siteMutedClass}>Loading…</p>
          </PageShell>
        </>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
