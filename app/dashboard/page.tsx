'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../../components/Header'
import PageShell, {
  siteAlertSuccessClass,
  siteBadgeActiveClass,
  siteBadgePendingClass,
  siteCardClass,
  siteEyebrowClass,
  siteInsetPanelClass,
  siteLinkClass,
  siteMutedClass,
  sitePageHeroClass,
  sitePrimaryBtnClass,
  siteSecondaryBtnClass,
  siteSectionTitleClass,
  siteStatCardClass,
  siteStatusBadgeClass,
} from '../../components/PageShell'
import PageLoading from '../../components/PageLoading'
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
    return <PageLoading label={t('common.loading')} />
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

  const quickLinks = [
    { href: '/courses', label: t('common.browseCourses'), primary: true },
    { href: '/pricing', label: t('common.subscription'), primary: false },
    { href: '/affiliate', label: t('common.affiliate'), primary: false },
    { href: '/certificates', label: t('common.certificates'), primary: false },
    ...(canAccessAdminPanel(user.role)
      ? [{ href: '/admin', label: t('common.admin'), primary: false }]
      : []),
  ]

  return (
    <>
      <Header />
      <PageShell className="mx-auto max-w-6xl">
        {checkoutMessage ? (
          <div className={`${siteAlertSuccessClass} mb-6`}>{checkoutMessage}</div>
        ) : null}

        <header className={sitePageHeroClass}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_50%)]" />
          <div className="relative">
            <p className={`${siteEyebrowClass} text-teal-300/90`}>{t('common.dashboard')}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {t('common.welcomeBack')}, {user.name ?? 'Learner'}
            </h1>
            {user.email ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
                {user.email}
              </p>
            ) : null}
          </div>
        </header>

        <nav
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          aria-label={t('common.dashboard')}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.primary
                  ? `${sitePrimaryBtnClass} shrink-0 whitespace-nowrap`
                  : `${siteSecondaryBtnClass} shrink-0 whitespace-nowrap`
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          <div className={`${siteStatCardClass} flex min-h-[9rem] flex-col border-t-4 border-t-blue-600`}>
            <p className={siteSectionTitleClass}>{t('common.subscription')}</p>
            {activeSubscription ? (
              <>
                <p className="mt-2 truncate text-xl font-bold text-slate-900 sm:text-2xl">
                  {activeSubscription.plan}
                </p>
                <p className="mt-1 text-xs leading-snug text-slate-600">
                  {t('common.renewsEnds')} {new Date(activeSubscription.endDate).toLocaleDateString()}
                </p>
                <span className={`${siteBadgeActiveClass} mt-auto w-fit pt-2`}>{t('common.active')}</span>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm font-medium leading-snug text-amber-800">{t('common.noActivePlan')}</p>
                <Link href="/pricing" className={`${siteLinkClass} mt-auto inline-block pt-2 text-xs`}>
                  {t('common.subscription')} →
                </Link>
              </>
            )}
          </div>
          <div className={`${siteStatCardClass} flex min-h-[9rem] flex-col border-t-4 border-t-teal-600`}>
            <p className={siteSectionTitleClass}>{t('common.courseCompletion')}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{completionPercent}%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="mt-auto pt-2 text-xs leading-snug text-slate-600">{t('common.acrossEnrolledCourses')}</p>
          </div>
          <div className={`${siteStatCardClass} flex min-h-[9rem] flex-col border-t-4 border-t-emerald-600`}>
            <p className={siteSectionTitleClass}>{t('common.certificates')}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{certificates.length}</p>
            {certificates.length > 0 ? (
              <Link href="/certificates" className={`${siteLinkClass} mt-auto inline-block pt-2 text-xs`}>
                {t('common.certificates')} →
              </Link>
            ) : (
              <p className="mt-auto pt-2 text-xs text-slate-500">{t('common.noCertificates')}</p>
            )}
          </div>
          <div className={`${siteStatCardClass} flex min-h-[9rem] flex-col border-t-4 border-t-indigo-600`}>
            <p className={siteSectionTitleClass}>{t('common.payments')}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{payments.length}</p>
            <p className="mt-auto pt-2 text-xs leading-snug text-slate-600">{t('common.paymentHistory')}</p>
          </div>
        </div>

        {(continueCourse || recentAside.length > 0) && (
          <div
            className={`mb-8 grid gap-4 ${
              continueCourse && recentAside.length > 0 ? 'lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {continueCourse ? (
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-teal-700 p-5 text-white shadow-lg ring-1 ring-black/10 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100">{t('common.continueLearning')}</p>
                <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">{continueCourse.course.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-blue-100/90">{continueCourse.course.description}</p>
                <Link
                  href={`/courses/${continueCourse.course.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-950 shadow-md transition hover:bg-teal-50"
                >
                  {t('common.openCourse')}
                </Link>
              </div>
            ) : null}
            {recentAside.length > 0 ? (
              <div className={`${siteCardClass} p-5 sm:p-6`}>
                <h2 className={siteSectionTitleClass}>{t('common.recentlyViewed')}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {recentAside.map((r) => (
                    <li key={r.courseId}>
                      <Link
                        href={`/courses/${r.courseId}`}
                        className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <span className="truncate">{r.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${siteCardClass} p-5 sm:p-6`}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-blue-950 sm:text-xl">{t('common.enrolledCourses')}</h2>
              {enrollments.length === 0 ? (
                <Link href="/courses" className={`${sitePrimaryBtnClass} w-full text-center sm:w-auto`}>
                  {t('common.browseCourses')}
                </Link>
              ) : null}
            </div>
            {enrollments.length === 0 ? (
              <div className={`${siteInsetPanelClass} text-center`}>
                <p className={siteMutedClass}>{t('common.noEnrollments')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const progress = parseCourseProgress(enrollment.progress)
                  const progressPercent = progress.completed ? 100 : Math.min((progress.lastPage / 10) * 100, 90)

                  return (
                    <article key={enrollment.id} className={siteInsetPanelClass}>
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-lg font-bold text-blue-950">{enrollment.course.title}</h3>
                        <span className={progress.completed ? siteBadgeActiveClass : siteBadgePendingClass}>
                          {progress.completed ? t('common.completed') : t('common.inProgress')}
                        </span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {t('common.category')}: {enrollment.course.category.name}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">{enrollment.course.description}</p>

                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-sm text-slate-600">
                          <span>{t('common.progress')}</span>
                          <span className="font-semibold tabular-nums">{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Link href={`/courses/${enrollment.course.id}`} className={siteLinkClass}>
                          {progress.completed ? t('common.reviewCourse') : t('common.continueLearning')} →
                        </Link>
                        <span className="text-xs text-slate-500">
                          {t('common.enrolled')} {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className={`${siteSectionTitleClass} mb-4`}>{t('common.paymentHistory')}</h2>
              {payments.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noPayments')}</p>
              ) : (
                <ul className="space-y-2">
                  {payments.slice(0, 12).map((p) => (
                    <li
                      key={p.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-sm"
                    >
                      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-3">
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {new Date(p.createdAt).toLocaleString()}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                          ${p.amount.toFixed(2)} {p.currency?.toUpperCase()}
                        </span>
                        <span className={`${siteStatusBadgeClass(p.status)} w-fit`}>{p.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className={`${siteSectionTitleClass} mb-4`}>{t('common.subscriptionHistory')}</h2>
              {subscriptions.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noSubscriptions')}</p>
              ) : (
                <ul className="space-y-2">
                  {subscriptions.slice(0, 8).map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{s.plan}</span>
                        {s.active ? <span className={siteBadgeActiveClass}>{t('common.active')}</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={`${siteCardClass} p-5 sm:p-6`}>
              <h2 className={`${siteSectionTitleClass} mb-4`}>{t('common.certificates')}</h2>
              {certificates.length === 0 ? (
                <p className={siteMutedClass}>{t('common.noCertificates')}</p>
              ) : (
                <ul className="space-y-3">
                  {certificates.map((c) => (
                    <li key={c.id} className={siteInsetPanelClass}>
                      <span className="font-semibold text-blue-950">{c.course.title}</span>
                      <span className="mt-1 block font-mono text-xs text-slate-600">{c.certificateNumber}</span>
                      <Link
                        href={`/verify/certificate/${encodeURIComponent(c.certificateNumber)}`}
                        className={`${siteLinkClass} mt-2 inline-block text-xs`}
                      >
                        {t('common.verifyPublicly')} →
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

function DashboardSuspenseFallback() {
  const { t } = useI18n()
  return <PageLoading label={t('common.loading')} />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSuspenseFallback />}>
      <DashboardContent />
    </Suspense>
  )
}
