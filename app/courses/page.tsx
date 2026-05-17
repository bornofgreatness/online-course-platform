'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell from '../../components/PageShell'
import CourseListCard from '../../components/CourseListCard'
import { CourseCategorySidebarIcon } from '../../components/CourseCategorySidebarIcon'
import { useI18n } from '../../components/LanguageProvider'

interface CourseCategory {
  id: string
  name: string
  icon?: string | null
  imageUrl?: string | null
}

interface CourseSubcategory {
  id: string
  name: string
}

interface CatalogSubcategory {
  id: string
  name: string
  courseCount: number
}

interface CatalogCategory {
  id: string
  name: string
  icon?: string | null
  imageUrl?: string | null
  subcategories: CatalogSubcategory[]
}

interface Course {
  id: string
  title: string
  description: string
  category: CourseCategory
  subcategory?: CourseSubcategory | null
  workloadHours: number
  thumbnailUrl?: string | null
  enrollments: Array<{ id: string }>
}

type SubcategoryGroup = {
  id: string
  name: string
  courses: Course[]
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
  const { t } = useI18n()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const coursesListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetch('/api/courses'), fetch('/api/categories')])
      .then(([coursesRes, categoriesRes]) =>
        Promise.all([coursesRes.json(), categoriesRes.json()])
      )
      .then(([coursesData, categoriesData]) => {
        const withEnrollments = coursesData.map((c: Course) => ({
          ...c,
          enrollments: c.enrollments || [],
        }))
        setCourses(withEnrollments)
        setCatalogCategories(Array.isArray(categoriesData) ? categoriesData : [])
      })
  }, [])

  const categoryOptions = useMemo(() => {
    const byId = new Map<string, CourseCategory>()
    for (const c of courses) {
      const cat = c.category
      if (cat?.id) byId.set(cat.id, cat)
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
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

    if (selectedCategoryId) {
      filtered = filtered.filter((course) => course.category.id === selectedCategoryId)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategoryId])

  const categoryRowClass = (active: boolean) =>
    [
      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
      active ? 'border-l-4 border-teal-700 bg-teal-50 pl-2' : 'border-l-4 border-transparent hover:bg-gray-50',
    ].join(' ')

  const scrollToCourses = () => {
    coursesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const mobileCategoryRow = (cat: CourseCategory | null, active: boolean, onSelect: () => void) => (
    <button
      type="button"
      key={cat?.id ?? 'all'}
      onClick={onSelect}
      className={`flex w-full items-center justify-between border-b border-gray-100 py-3.5 pl-1 pr-2 text-left last:border-b-0 ${
        active ? 'bg-slate-50' : 'active:bg-gray-50'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <CourseCategorySidebarIcon categoryName={cat?.name ?? null} icon={cat?.icon} />
        <span className="truncate text-sm font-bold text-gray-900">{cat ? cat.name : t('common.allCategories')}</span>
      </span>
      <Chevron active={active} />
    </button>
  )

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategoryId) return ''
    return categoryOptions.find((c) => c.id === selectedCategoryId)?.name ?? ''
  }, [categoryOptions, selectedCategoryId])

  const subcategoryGroups = useMemo((): SubcategoryGroup[] | null => {
    if (!selectedCategoryId) return null
    const catalog = catalogCategories.find((c) => c.id === selectedCategoryId)
    if (!catalog?.subcategories.length) return null

    const groups: SubcategoryGroup[] = catalog.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      courses: filteredCourses.filter((c) => c.subcategory?.id === sub.id),
    }))

    const uncategorized = filteredCourses.filter((c) => !c.subcategory?.id)
    if (uncategorized.length > 0) {
      groups.push({
        id: '__uncategorized__',
        name: t('category.uncategorized'),
        courses: uncategorized,
      })
    }

    return groups
  }, [catalogCategories, selectedCategoryId, filteredCourses, t])

  const renderCourseCard = (course: Course) => (
    <CourseListCard
      key={course.id}
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
      }}
    />
  )

  return (
    <>
      <Header />

      <PageShell className="pt-2 lg:pt-6">
        <div className="lg:hidden">
        <div className="space-y-3 px-0 py-4">
          <button
            type="button"
            onClick={scrollToCourses}
            className="w-full rounded-xl bg-black py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-gray-900"
          >
            {t('course.available')}
          </button>
          {status !== 'loading' && session ? (
            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t('common.dashboard')}
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="block w-full rounded-xl bg-emerald-600 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t('common.signup')}
            </Link>
          )}
          {status !== 'loading' && session ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/courses' })}
              className="block w-full py-2 text-center text-sm font-semibold uppercase tracking-wide text-black underline decoration-2 underline-offset-4"
            >
              {t('common.logout')}
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block w-full py-2 text-center text-sm font-semibold uppercase tracking-wide text-black underline decoration-2 underline-offset-4"
            >
              {t('common.login')}
            </Link>
          )}
        </div>

        <div className="px-0 pb-2">
          <h2 className="mb-2 text-base font-bold text-slate-900">{t('common.categories')}</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {mobileCategoryRow(null, selectedCategoryId === '', () => setSelectedCategoryId(''))}
            {categoryOptions.map((cat) =>
              mobileCategoryRow(cat, selectedCategoryId === cat.id, () => setSelectedCategoryId(cat.id))
            )}
          </div>
        </div>

        <div className="px-0 pb-3">
          <label htmlFor="courses-mobile-search" className="sr-only">
            {t('course.search')}
          </label>
          <input
            id="courses-mobile-search"
            type="search"
            placeholder={t('course.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 lg:block">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-900">{t('common.categories')}</h2>
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('')}
                className={categoryRowClass(selectedCategoryId === '')}
              >
                <CourseCategorySidebarIcon categoryName={null} />
                <span className="text-sm font-bold leading-tight text-black">{t('common.allCategories')}</span>
              </button>
              {categoryOptions.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={categoryRowClass(selectedCategoryId === cat.id)}
                >
                  <CourseCategorySidebarIcon categoryName={cat.name} icon={cat.icon} />
                  <span className="text-sm font-bold leading-tight text-black">{cat.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section>
            <div className="mb-5 hidden flex-col gap-4 lg:flex lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900 md:text-base">{t('course.available')}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedCategoryLabel ? (
                    <>
                      <span className="font-medium text-slate-800">{selectedCategoryLabel}</span>
                      {' · '}
                    </>
                  ) : null}
                  {t('course.showing', {
                    count: filteredCourses.length,
                    plural: filteredCourses.length !== 1 ? 's' : '',
                  })}
                </p>
              </div>
              <input
                type="search"
                placeholder={t('course.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:max-w-xs md:max-w-sm"
              />
            </div>

            <div ref={coursesListRef}>
              {subcategoryGroups ? (
                <div className="space-y-10">
                  {subcategoryGroups.map((group) => (
                    <section key={group.id}>
                      <h3 className="text-base font-bold text-slate-900 md:text-lg">{group.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {group.courses.length}{' '}
                        {group.courses.length === 1 ? t('common.course') : t('common.coursesCount')}
                      </p>
                      {group.courses.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {group.courses.map(renderCourseCard)}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">{t('category.noCoursesSub')}</p>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCourses.map(renderCourseCard)}
                </div>
              )}
            </div>

            {filteredCourses.length === 0 && courses.length > 0 && (
              <div className="mt-10 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-600">{t('course.noCoursesFound')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategoryId('')
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t('course.showAll')}
                </button>
              </div>
            )}
          </section>
        </div>
      </PageShell>
    </>
  )
}
