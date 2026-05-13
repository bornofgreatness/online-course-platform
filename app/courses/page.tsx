'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import { CourseCategorySidebarIcon } from '../../components/CourseCategorySidebarIcon'
import { getCourseCardDisplay, initialsFromName } from '../../lib/courseCardDisplay'

interface Course {
  id: string
  title: string
  description: string
  category: { id: string; name: string }
  workloadHours: number
  thumbnailUrl?: string | null
  enrollments: Array<{ id: string }>
}

function Chevron({ active }: { active: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${active ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Courses() {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const coursesListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((courses) => {
        const withEnrollments = courses.map((c: any) => ({
          ...c,
          enrollments: c.enrollments || [],
        }))
        setCourses(withEnrollments)
      })
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  const categoryOptions = useMemo(() => {
    const names = Array.from(new Set(courses.map((c) => c.category?.name).filter(Boolean))) as string[]
    return names.sort((a, b) => a.localeCompare(b))
  }, [courses])

  useEffect(() => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category.name === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategory])

  const categoryRowClass = (active: boolean) =>
    [
      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
      active ? 'border-l-4 border-teal-700 bg-teal-50 pl-2' : 'border-l-4 border-transparent hover:bg-gray-50',
    ].join(' ')

  const scrollToCourses = () => {
    coursesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const mobileCategoryRow = (name: string | null, active: boolean, onSelect: () => void) => (
    <button
      type="button"
      key={name ?? 'all'}
      onClick={onSelect}
      className={`flex w-full items-center justify-between border-b border-gray-100 py-3.5 pl-1 pr-2 text-left last:border-b-0 ${
        active ? 'bg-slate-50' : 'active:bg-gray-50'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <CourseCategorySidebarIcon categoryName={name} />
        <span className="truncate text-sm font-bold text-gray-900">{name ? name : 'All categories'}</span>
      </span>
      <Chevron active={active} />
    </button>
  )

  return (
    <>
      <Header />

      {/* Mobile: black bar, CTAs, accordion categories (desktop header hidden for /courses) */}
      <div className="lg:hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between bg-black px-4 py-3.5">
          <Link href="/" className="text-sm font-bold uppercase tracking-wide text-white">
            Course Platform
          </Link>
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
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="text-sm font-bold text-slate-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-gray-100"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 text-sm font-semibold">
                <Link href="/" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/courses" className="rounded-lg px-3 py-2.5 text-teal-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Courses
                </Link>
                <Link href="/categories" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Categories
                </Link>
                <Link href="/certificates" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Certificates
                </Link>
                <Link href="/pricing" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                  Prices
                </Link>
                {session ? (
                  <>
                    <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                    {(session.user as { role?: string })?.role === 'ADMIN' && (
                      <Link href="/admin" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                        Admin
                      </Link>
                    )}
                    <button
                      type="button"
                      className="mt-auto rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: '/courses' })
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <Link href="/auth/signup" className="rounded-lg px-3 py-2.5 text-slate-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}

        <div className="space-y-3 bg-slate-100/80 px-4 py-4">
          <button
            type="button"
            onClick={scrollToCourses}
            className="w-full rounded-xl bg-black py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-gray-900"
          >
            Available courses
          </button>
          {status !== 'loading' && session ? (
            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="block w-full rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700"
            >
              Sign up
            </Link>
          )}
          {status !== 'loading' && session ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/courses' })}
              className="block w-full py-2 text-center text-sm font-semibold uppercase tracking-wide text-black underline decoration-2 underline-offset-4"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block w-full py-2 text-center text-sm font-semibold uppercase tracking-wide text-black underline decoration-2 underline-offset-4"
            >
              Login
            </Link>
          )}
        </div>

        <div className="bg-slate-100/80 px-4 pb-2">
          <h2 className="mb-2 text-base font-bold text-slate-900">Categories</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {mobileCategoryRow(null, selectedCategory === '', () => setSelectedCategory(''))}
            {categoryOptions.map((name) =>
              mobileCategoryRow(name, selectedCategory === name, () => setSelectedCategory(name))
            )}
          </div>
        </div>

        <div className="bg-slate-100/80 px-4 pb-3">
          <label htmlFor="courses-mobile-search" className="sr-only">
            Search courses
          </label>
          <input
            id="courses-mobile-search"
            type="search"
            placeholder="Search courses…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <div className="min-h-screen bg-slate-100/80 px-4 pb-10 pt-3 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 lg:block">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-900">Categories</h2>
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={categoryRowClass(selectedCategory === '')}
              >
                <CourseCategorySidebarIcon categoryName={null} />
                <span className="text-sm font-bold leading-tight text-black">All categories</span>
              </button>
              {categoryOptions.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={categoryRowClass(selectedCategory === name)}
                >
                  <CourseCategorySidebarIcon categoryName={name} />
                  <span className="text-sm font-bold leading-tight text-black">{name}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section>
            <div className="mb-5 hidden flex-col gap-4 lg:flex lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900 md:text-base">Available courses</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedCategory ? (
                    <>
                      <span className="font-medium text-slate-800">{selectedCategory}</span>
                      {' · '}
                    </>
                  ) : null}
                  Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </p>
              </div>
              <input
                type="search"
                placeholder="Search courses…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:max-w-xs md:max-w-sm"
              />
            </div>

            <div ref={coursesListRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const d = getCourseCardDisplay(course.id)
                const initials = initialsFromName(d.instructor)
                return (
                  <article
                    key={course.id}
                    className="flex flex-row overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
                  >
                    <div className="relative w-[34%] min-w-[100px] max-w-[130px] shrink-0 self-stretch bg-slate-200 sm:w-[40%] sm:max-w-[220px]">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full min-h-[112px] w-full object-cover sm:min-h-[168px] sm:rounded-l-xl sm:rounded-r-none"
                        />
                      ) : (
                        <div className="flex h-full min-h-[112px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl text-slate-500 sm:min-h-[168px] sm:rounded-l-xl">
                          📚
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-blue-950 sm:text-base">
                            {course.title}
                          </h3>
                          <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
                            <svg className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">{d.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 lg:line-clamp-2 lg:block">{course.description}</p>
                        <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-9 sm:w-9 sm:text-xs ${d.avatarClass}`}
                          >
                            {initials}
                          </div>
                          <span className="truncate text-xs font-medium text-slate-800 sm:text-sm">{d.instructor}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
                        <span className="text-base font-bold tabular-nums text-blue-950 sm:text-lg">{d.priceLabel}</span>
                        <Link
                          href={`/courses/${course.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-blue-700 sm:px-4 sm:py-2.5 sm:text-xs"
                        >
                          Access course
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {filteredCourses.length === 0 && courses.length > 0 && (
              <div className="mt-10 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-600">No courses found for this category or search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Show all courses
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
