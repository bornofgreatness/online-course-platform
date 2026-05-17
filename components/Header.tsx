'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import LanguageSwitch from './LanguageSwitch'
import { useI18n } from './LanguageProvider'

type NavCategory = { id: string; name: string; courseCount: number; icon?: string | null; imageUrl?: string | null }

export default function Header() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: NavCategory[]) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoriesOpen) return
    const onDoc = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [categoriesOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const pathname = usePathname()

  const navText = (active: boolean) =>
    [
      'text-sm font-bold uppercase tracking-wide transition-colors',
      active ? 'text-teal-700' : 'text-black hover:text-teal-700',
    ].join(' ')

  const categoriesActive = pathname.startsWith('/categories')
  const coursesActive = pathname === '/courses' || pathname.startsWith('/courses/')
  const signinActive = pathname.startsWith('/auth/signin')
  const forgotActive = pathname.startsWith('/auth/forgot-password')
  const signupActive = pathname.startsWith('/auth/signup')
  const certificatesActive = pathname.startsWith('/certificates')
  const pricingActive = pathname.startsWith('/pricing')
  const dashboardActive = pathname.startsWith('/dashboard')

  const drawerLinkClass = 'rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50'

  return (
    <>
      {/* Mobile: matches courses page top bar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black lg:hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <Link href="/" className="text-sm font-bold uppercase tracking-wide text-white">
            {t('common.home')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-white p-2 text-white hover:bg-white/10"
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
            >
              <span className="flex h-4 w-5 flex-col justify-center gap-1">
                <span className="h-0.5 w-full rounded-full bg-white" />
                <span className="h-0.5 w-full rounded-full bg-white" />
                <span className="h-0.5 w-full rounded-full bg-white" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label={t('common.close')}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="text-sm font-bold text-slate-900">{t('common.menu')}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-gray-100"
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 text-sm font-semibold">
              <Link href="/" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                {t('common.home')}
              </Link>
              <Link
                href="/courses"
                className={`${drawerLinkClass} ${coursesActive ? 'text-teal-700' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.courses')}
              </Link>
              <Link href="/categories" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                {t('common.categories')}
              </Link>
              <Link href="/certificates" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                {t('common.certificates')}
              </Link>
              <Link href="/pricing" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                {t('common.prices')}
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    {t('common.dashboard')}
                  </Link>
                  <Link href="/affiliate" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    {t('common.affiliate')}
                  </Link>
                  {['ADMIN', 'SUPER_ADMIN'].includes(((session.user as { role?: string })?.role ?? '').toUpperCase()) && (
                    <Link href="/admin" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                      {t('common.admin')}
                    </Link>
                  )}
                  <button
                    type="button"
                    className="mt-auto rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                  >
                    {t('common.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    {t('common.login')}
                  </Link>
                  <Link href="/auth/signup" className={drawerLinkClass} onClick={() => setMobileMenuOpen(false)}>
                    {t('common.signupFreeCta')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <header className="hidden bg-white lg:block">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
          <Link
            href="/"
            className="text-xl font-bold uppercase tracking-tight text-slate-950 hover:opacity-80 md:text-2xl"
          >
            {t('common.home')}
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            {status === 'loading' ? (
                <span className="text-sm font-semibold uppercase text-gray-400">…</span>
            ) : session ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-gray-50 sm:px-5 sm:text-sm"
              >
                {t('common.logout')}
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-gray-50 sm:px-5 sm:text-sm"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-gray-900 sm:px-5 sm:text-sm"
                >
                  {t('common.signupFreeCta')}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="border-b border-gray-200 px-4 py-3 md:px-6">
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 md:gap-x-8">
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((o) => !o)}
                className={`inline-flex items-center gap-1 ${navText(categoriesActive || categoriesOpen)}`}
                aria-expanded={categoriesOpen}
                aria-haspopup="true"
              >
                {t('common.categories')}
                <span className="text-[0.65rem] font-bold" aria-hidden>
                  ▾
                </span>
              </button>
              {categoriesOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 max-h-[min(70vh,20rem)] min-w-[14rem] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg normal-case font-normal"
                  role="menu"
                >
                  <Link
                    href="/categories"
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                    role="menuitem"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {t('common.allCategories')}
                  </Link>
                  {categories.length > 0 && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/categories/${c.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <span className="flex shrink-0 items-center justify-center text-black">
                            <CourseCategorySidebarIcon categoryName={c.name} icon={c.icon} />
                          </span>
                          <span>
                            <span className="font-medium">{c.name}</span>
                            <span className="ml-1 text-xs text-gray-400">({c.courseCount})</span>
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/courses" className={navText(coursesActive)}>
              {t('common.courses')}
            </Link>

            {status === 'loading' ? null : !session ? (
              <span className="inline-flex flex-wrap items-center gap-1 text-sm font-bold uppercase tracking-wide">
                <Link href="/auth/signin" className={navText(signinActive)}>
                  {t('common.login')}
                </Link>
                <span className="text-black">/</span>
                <Link href="/auth/forgot-password" className={navText(forgotActive)}>
                  {t('common.password')}
                </Link>
              </span>
            ) : null}

            {!session && status !== 'loading' && (
              <Link href="/auth/signup" className={navText(signupActive)}>
                {t('common.signupFreeCta')}
              </Link>
            )}

            <Link href="/certificates" className={navText(certificatesActive)}>
              {t('common.certificates')}
            </Link>

            <Link href="/pricing" className={navText(pricingActive)}>
              {t('common.prices')}
            </Link>

            {status === 'loading' ? null : session ? (
              <>
                <Link href="/affiliate" className={navText(pathname.startsWith('/affiliate'))}>
                  {t('common.affiliate')}
                </Link>
                <Link href="/dashboard" className={navText(dashboardActive)}>
                  {t('common.dashboard')}
                </Link>
                {['ADMIN', 'SUPER_ADMIN'].includes(((session.user as { role?: string })?.role ?? '').toUpperCase()) && (
                  <Link href="/admin" className={navText(pathname.startsWith('/admin'))}>
                    {t('common.admin')}
                  </Link>
                )}
              </>
            ) : null}
          </nav>
        </div>
      </header>
    </>
  )
}
