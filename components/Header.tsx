'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type NavCategory = { id: string; name: string; courseCount: number }

export default function Header() {
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [categoriesOpen, setCategoriesOpen] = useState(false)
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

  const isCoursesListPage = pathname === '/courses'

  return (
    <header className={`bg-white ${isCoursesListPage ? 'hidden lg:block' : ''}`}>
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-tight text-slate-950 hover:opacity-80 md:text-2xl"
        >
          Course Platform
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {status === 'loading' ? (
            <span className="text-sm font-semibold uppercase text-gray-400">…</span>
          ) : session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-gray-50 sm:px-5 sm:text-sm"
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-full border border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-gray-50 sm:px-5 sm:text-sm"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-gray-900 sm:px-5 sm:text-sm"
              >
                Sign up
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
              Categories
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
                  All categories
                </Link>
                {categories.length > 0 && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.id}`}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                        role="menuitem"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-1 text-xs text-gray-400">({c.courseCount})</span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/courses" className={navText(coursesActive)}>
            Courses
          </Link>

          {status === 'loading' ? null : !session ? (
            <span className="inline-flex flex-wrap items-center gap-1 text-sm font-bold uppercase tracking-wide">
              <Link href="/auth/signin" className={navText(signinActive)}>
                Login
              </Link>
              <span className="text-black">/</span>
              <Link href="/auth/forgot-password" className={navText(forgotActive)}>
                Password
              </Link>
            </span>
          ) : null}

          {!session && status !== 'loading' && (
            <Link href="/auth/signup" className={navText(signupActive)}>
              Sign up
            </Link>
          )}

          <Link href="/certificates" className={navText(certificatesActive)}>
            Certificates
          </Link>

          <Link href="/pricing" className={navText(pricingActive)}>
            Prices
          </Link>

          {status === 'loading' ? null : session ? (
            <>
              <Link href="/dashboard" className={navText(dashboardActive)}>
                Dashboard
              </Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={navText(pathname.startsWith('/admin'))}
                >
                  Admin
                </Link>
              )}
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
