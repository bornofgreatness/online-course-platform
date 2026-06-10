'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import LanguageSwitch from './LanguageSwitch'
import LoadingImage from './LoadingImage'
import LoadingButtonLabel from './LoadingButtonLabel'
import { useI18n } from './LanguageProvider'
import { canAccessAdminPanel } from '../lib/auth/rbac'
import {
  PLATFORM_WHATSAPP,
  PLATFORM_WHATSAPP_DISPLAY,
  whatsappLink,
} from '../lib/whatsapp'

type NavCategory = {
  id: string
  name: string
  courseCount: number
  icon?: string | null
  imageUrl?: string | null
  subcategories?: Array<{ id: string; name: string; courseCount: number }>
}

export default function Header() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [certificatesOpen, setCertificatesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false)
  const [mobileCursosOpen, setMobileCursosOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const certificatesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data: NavCategory[]) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!categoriesOpen && !certificatesOpen) return
    const onDoc = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
      }
      if (certificatesRef.current && !certificatesRef.current.contains(e.target as Node)) {
        setCertificatesOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [categoriesOpen, certificatesOpen])

  useEffect(() => {
    if (!mobileMenuVisible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuVisible])

  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuVisible) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen, mobileMenuVisible])

  const openMobileMenu = () => {
    setMobileMenuVisible(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMobileMenuOpen(true))
    })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    window.setTimeout(() => {
      setMobileMenuVisible(false)
      setMobilePagesOpen(false)
      setMobileCursosOpen(false)
    }, 300)
  }

  const handleLogout = async () => {
    if (logoutLoading) return
    setLogoutLoading(true)
    await signOut({ callbackUrl: '/' })
  }

  const pathname = usePathname()
  const userRole = session?.user?.role
  const isAdmin = canAccessAdminPanel(userRole)
  const showStudentNav = !!session
  const orderedCategories = useMemo(() => {
    const withSubs = categories.filter((c) => (c.subcategories?.length || 0) > 0)
    const withoutSubs = categories.filter((c) => (c.subcategories?.length || 0) === 0)
    return [...withSubs, ...withoutSubs]
  }, [categories])

  const navText = (active: boolean) =>
    [
      'text-sm font-bold uppercase tracking-wide transition-colors',
      active ? 'text-teal-700' : 'text-slate-800 hover:text-teal-700',
    ].join(' ')

  const categoriesActive = pathname.startsWith('/categories')
  const coursesActive = pathname === '/courses' || pathname.startsWith('/courses/')
  const signinActive = pathname.startsWith('/auth/signin')
  const forgotActive = pathname.startsWith('/auth/forgot-password')
  const signupActive = pathname.startsWith('/auth/signup')
  const certificatesActive = pathname.startsWith('/certificates')
  const pricingActive = pathname.startsWith('/pricing')
  const aboutActive = pathname.startsWith('/about')
  const dashboardActive = pathname.startsWith('/dashboard')

  const mobileNavItem =
    'block border-b border-white/10 px-5 py-4 text-base font-medium text-white transition hover:bg-white/5'
  const mobileSubItem =
    'block border-b border-white/5 px-8 py-3 text-sm text-white/90 transition hover:bg-white/5'

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center px-3 py-2.5">
          <Link href="/" className="block shrink-0">
            <Image
              src="/logo.jpg"
              alt={t('certificate.brandName')}
              width={140}
              height={56}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="mx-3 h-9 w-px shrink-0 bg-slate-200" aria-hidden />
          <div className="flex flex-1 items-center justify-end gap-0.5">
            <Link
              href="/courses"
              className="rounded-lg p-2.5 text-slate-900 transition hover:bg-slate-50"
              aria-label={t('header.search')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg p-2.5 text-slate-900 transition hover:bg-slate-50"
              aria-label={t('header.cart')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1.5 6h12M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
            </Link>
            <button
              type="button"
              onClick={openMobileMenu}
              className="rounded-lg p-2.5 text-slate-900 transition hover:bg-slate-50"
              aria-expanded={mobileMenuOpen}
              aria-label={t('common.menu')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuVisible && (
        <div
          className={`fixed inset-0 z-[100] lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label={t('common.close')}
            onClick={closeMobileMenu}
          />
          <div
            className={`absolute right-0 top-0 flex h-full w-[min(88%,20rem)] flex-col bg-[#1c1c1c] shadow-2xl transition-transform duration-300 ease-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Link href="/" onClick={closeMobileMenu} className="block shrink-0">
                <Image
                  src="/logo.jpg"
                  alt={t('certificate.brandName')}
                  width={140}
                  height={56}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-lg p-2 text-white transition hover:bg-white/10"
                aria-label={t('common.close')}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto">
              <Link href="/" className={mobileNavItem} onClick={closeMobileMenu}>
                {t('common.home')}
              </Link>

              <div>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between ${mobileNavItem}`}
                  onClick={() => setMobilePagesOpen((o) => !o)}
                  aria-expanded={mobilePagesOpen}
                >
                  {t('header.pages')}
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${mobilePagesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobilePagesOpen && (
                  <div className="bg-black/20">
                    <Link href="/about" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.about')}
                    </Link>
                    <Link href="/pricing" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.prices')}
                    </Link>
                    <Link href="/blog" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.blog')}
                    </Link>
                    <Link href="/certificates" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.certificates')}
                    </Link>
                    {showStudentNav && (
                      <>
                        <Link href="/dashboard" className={mobileSubItem} onClick={closeMobileMenu}>
                          {t('common.dashboard')}
                        </Link>
                        <Link href="/affiliate" className={mobileSubItem} onClick={closeMobileMenu}>
                          {t('common.affiliate')}
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className={mobileSubItem} onClick={closeMobileMenu}>
                            {t('common.admin')}
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between ${mobileNavItem}`}
                  onClick={() => setMobileCursosOpen((o) => !o)}
                  aria-expanded={mobileCursosOpen}
                >
                  {t('common.courses')}
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${mobileCursosOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileCursosOpen && (
                  <div className="bg-black/20">
                    <Link href="/courses" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.courses')}
                    </Link>
                    <Link href="/categories" className={mobileSubItem} onClick={closeMobileMenu}>
                      {t('common.allCategories')}
                    </Link>
                    {orderedCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.id}`}
                        className={`${mobileSubItem} flex items-center gap-2`}
                        onClick={closeMobileMenu}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                          <CourseCategorySidebarIcon categoryName={c.name} icon={c.icon} />
                        </span>
                        <span>
                          {c.name}
                          <span className="ml-1 text-xs text-white/50">({c.courseCount})</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {showStudentNav ? (
                <button
                  type="button"
                  disabled={logoutLoading}
                  aria-busy={logoutLoading}
                  className={`${mobileNavItem} text-left disabled:cursor-not-allowed disabled:opacity-80`}
                  onClick={() => {
                    void handleLogout()
                  }}
                >
                  {logoutLoading ? (
                    <LoadingButtonLabel loading label={t('common.loading')} color="default">
                      {t('common.logout')}
                    </LoadingButtonLabel>
                  ) : (
                    t('common.logout')
                  )}
                </button>
              ) : (
                <Link href="/auth/signin" className={mobileNavItem} onClick={closeMobileMenu}>
                  {t('common.login')}
                </Link>
              )}
            </nav>

            <div className="mt-auto space-y-5 border-t border-white/10 px-5 py-6">
              {session?.user?.email ? (
                <div className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-teal-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/50">
                      {t('common.email')}
                    </p>
                    <p className="break-all text-sm font-semibold text-white">{session.user.email}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-teal-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-white/50">
                    {t('contact.whatsapp')}
                  </p>
                  <a
                    href={whatsappLink(PLATFORM_WHATSAPP)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white hover:text-teal-400"
                  >
                    {PLATFORM_WHATSAPP_DISPLAY}
                  </a>
                </div>
              </div>
              <LanguageSwitch compact />
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 hidden border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md lg:block">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          <Link href="/" className="block shrink-0 hover:opacity-90">
            <Image
              src="/logo.jpg"
              alt={t('certificate.brandName')}
              width={180}
              height={72}
              className="h-10 w-auto object-contain md:h-12"
              priority
            />
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            {status === 'loading' ? (
              <LoadingImage size="sm" className="px-2" />
            ) : session ? (
              <button
                type="button"
                onClick={() => {
                  void handleLogout()
                }}
                disabled={logoutLoading}
                aria-busy={logoutLoading}
                className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-80 sm:min-w-[6.5rem] sm:px-5 sm:text-sm"
              >
                {logoutLoading ? (
                  <LoadingButtonLabel loading label={t('common.loading')} color="default">
                    {t('common.logout')}
                  </LoadingButtonLabel>
                ) : (
                  t('common.logout')
                )}
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-sm transition hover:bg-slate-50 sm:px-5 sm:text-sm"
                >
                  {t('common.login')}
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md transition hover:from-slate-800 hover:to-slate-700 sm:px-5 sm:text-sm"
                >
                  {t('common.signupFreeCta')}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="border-t border-slate-200/80 px-4 py-3 md:px-6">
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
                  {orderedCategories.length > 0 && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      {orderedCategories.map((c) => (
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

            {session ? (
              <div className="relative" ref={certificatesRef}>
                <button
                  type="button"
                  onClick={() => setCertificatesOpen((o) => !o)}
                  className={`inline-flex items-center gap-1 ${navText(certificatesActive || certificatesOpen)}`}
                  aria-expanded={certificatesOpen}
                  aria-haspopup="true"
                >
                  {t('common.certificates')}
                  <span className="text-[0.65rem] font-bold" aria-hidden>
                    ▾
                  </span>
                </button>
                {certificatesOpen && (
                  <div
                    className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg normal-case font-normal"
                    role="menu"
                  >
                    <Link
                      href="/certificates?tab=mine"
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setCertificatesOpen(false)}
                    >
                      {t('certificate.tabMine')}
                    </Link>
                    <Link
                      href="/certificates?tab=completed"
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setCertificatesOpen(false)}
                    >
                      {t('certificate.tabCompleted')}
                    </Link>
                    <Link
                      href="/certificates?tab=progress"
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      role="menuitem"
                      onClick={() => setCertificatesOpen(false)}
                    >
                      {t('certificate.tabInProgress')}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/certificates" className={navText(certificatesActive)}>
                {t('common.certificates')}
              </Link>
            )}

            <Link href="/pricing" className={navText(pricingActive)}>
              {t('common.prices')}
            </Link>

            <Link href="/about" className={navText(aboutActive)}>
              {t('common.about')}
            </Link>

            {status === 'loading' ? null : showStudentNav ? (
              <>
                <Link href="/affiliate" className={navText(pathname.startsWith('/affiliate'))}>
                  {t('common.affiliate')}
                </Link>
                <Link href="/dashboard" className={navText(dashboardActive)}>
                  {t('common.dashboard')}
                </Link>
                {isAdmin && (
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
