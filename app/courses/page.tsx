'use client'

import { useEffect, useMemo, useState } from 'react'
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

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(courses => {
        const withEnrollments = courses.map((c: any) => ({
          ...c,
          enrollments: c.enrollments || []
        }))
        setCourses(withEnrollments)
      })
  }, [])

  const categoryOptions = useMemo(() => {
    const names = Array.from(
      new Set(courses.map((c) => c.category?.name).filter(Boolean))
    ) as string[]
    return names.sort((a, b) => a.localeCompare(b))
  }, [courses])

  useEffect(() => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(course => course.category.name === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategory])

  const categoryRowClass = (active: boolean) =>
    [
      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
      active
        ? 'border-l-4 border-teal-700 bg-teal-50 pl-2'
        : 'border-l-4 border-transparent hover:bg-gray-50',
    ].join(' ')

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-100/80 p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5">
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
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900 md:text-base">
                  Available courses
                </h2>
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => {
                const d = getCourseCardDisplay(course.id)
                const initials = initialsFromName(d.instructor)
                return (
                  <article
                    key={course.id}
                    className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg sm:flex-row"
                  >
                    <div className="relative aspect-[16/10] w-full shrink-0 bg-slate-200 sm:aspect-auto sm:w-[40%] sm:min-h-[168px] sm:max-w-[220px]">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover sm:rounded-l-xl sm:rounded-r-none"
                        />
                      ) : (
                        <div className="flex h-full min-h-[140px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl text-slate-500 sm:min-h-0 sm:rounded-l-xl">
                          📚
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 text-base font-bold leading-snug text-blue-950 sm:text-[0.95rem] md:text-base">
                            {course.title}
                          </h3>
                          <div className="flex shrink-0 items-center gap-1 pt-0.5">
                            <svg
                              className="h-4 w-4 text-amber-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold tabular-nums text-slate-800">
                              {d.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                          {course.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${d.avatarClass}`}
                          >
                            {initials}
                          </div>
                          <span className="truncate text-sm font-medium text-slate-800">{d.instructor}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span className="text-lg font-bold tabular-nums text-blue-950">{d.priceLabel}</span>
                        <Link
                          href={`/courses/${course.id}`}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-700"
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
