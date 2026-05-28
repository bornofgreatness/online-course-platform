'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell from '../../components/PageShell'
import CourseListCard from '../../components/CourseListCard'
import CatalogSidebar, { type CatalogCategoryItem } from '../../components/CatalogSidebar'
import { useI18n } from '../../components/LanguageProvider'
import { translateCategoryName } from '../../lib/i18n/translations'

interface CourseCategory {
  id: string
  name: string
  icon?: string | null
}

interface CourseSubcategory {
  id: string
  name: string
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

export default function Courses() {
  const { data: session, status } = useSession()
  const { t } = useI18n()
  const [courses, setCourses] = useState<Course[]>([])
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set())
  const coursesListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([fetch('/api/courses'), fetch('/api/categories')])
      .then(([coursesRes, categoriesRes]) => Promise.all([coursesRes.json(), categoriesRes.json()]))
      .then(([coursesData, categoriesData]) => {
        setCourses(
          coursesData.map((c: Course) => ({
            ...c,
            enrollments: c.enrollments || [],
          }))
        )
        if (Array.isArray(categoriesData)) {
          setCatalogCategories(
            categoriesData.map((c: { id: string; name: string; icon?: string | null; subcategories: { id: string; name: string; courseCount: number }[] }) => ({
              id: c.id,
              name: c.name,
              icon: c.icon,
              subcategories: (c.subcategories || []).map((s) => ({
                id: s.id,
                name: s.name,
                courseCount: s.courseCount,
              })),
            }))
          )
        }
      })
  }, [])

  const filteredCourses = useMemo(() => {
    let list = courses

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (course) =>
          course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
      )
    }

    if (selectedSubcategoryId) {
      list = list.filter((c) => c.subcategory?.id === selectedSubcategoryId)
    } else if (selectedCategoryId) {
      list = list.filter((c) => c.category.id === selectedCategoryId)
    }

    return list
  }, [courses, searchTerm, selectedCategoryId, selectedSubcategoryId])

  const toggleCategoryExpanded = useCallback((categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCategoryId('')
    setSelectedSubcategoryId('')
  }, [])

  const selectCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId)
      setSelectedSubcategoryId('')
      setExpandedCategoryIds((prev) => new Set(prev).add(categoryId))
    },
    []
  )

  const selectSubcategory = useCallback((categoryId: string, subcategoryId: string) => {
    setSelectedCategoryId(categoryId)
    setSelectedSubcategoryId(subcategoryId)
    setExpandedCategoryIds((prev) => new Set(prev).add(categoryId))
  }, [])

  const panelTitle = useMemo(() => {
    if (selectedSubcategoryId) {
      for (const cat of catalogCategories) {
        const sub = cat.subcategories.find((s) => s.id === selectedSubcategoryId)
        if (sub) return sub.name
      }
    }
    if (selectedCategoryId) {
      const cat = catalogCategories.find((c) => c.id === selectedCategoryId)
      if (cat) return translateCategoryName(cat.name, t)
    }
    return t('course.available')
  }, [catalogCategories, selectedCategoryId, selectedSubcategoryId, t])

  const scrollToCourses = () => {
    coursesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderCourseCard = (course: Course) => (
    <CourseListCard
      key={course.id}
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        workloadHours: course.workloadHours,
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
          </div>

          <div className="px-0 pb-2">
            <h2 className="mb-2 text-base font-bold text-slate-900">{t('common.categories')}</h2>
            <div className="h-[calc(100vh-12rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <CatalogSidebar
                categories={catalogCategories}
                selectedCategoryId={selectedCategoryId}
                selectedSubcategoryId={selectedSubcategoryId}
                expandedCategoryIds={expandedCategoryIds}
                onSelectAll={selectAll}
                onSelectCategory={selectCategory}
                onSelectSubcategory={selectSubcategory}
                onToggleCategory={toggleCategoryExpanded}
              />
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
          <aside className="hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-md ring-1 ring-black/5 lg:block lg:sticky lg:top-24">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-900">
              {t('common.categories')}
            </h2>
            <CatalogSidebar
              categories={catalogCategories}
              selectedCategoryId={selectedCategoryId}
              selectedSubcategoryId={selectedSubcategoryId}
              expandedCategoryIds={expandedCategoryIds}
              onSelectAll={selectAll}
              onSelectCategory={selectCategory}
              onSelectSubcategory={selectSubcategory}
              onToggleCategory={toggleCategoryExpanded}
            />
          </aside>

          <section>
            <div className="mb-5 hidden flex-col gap-4 lg:flex lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900 md:text-base">
                  {panelTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
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

            <div ref={coursesListRef} className="mb-3 lg:hidden">
              <h2 className="mb-2 text-base font-bold text-slate-900">{panelTitle}</h2>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map(renderCourseCard)}
              </div>
            ) : courses.length > 0 ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-600">{t('course.noCoursesFound')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    selectAll()
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t('course.showAll')}
                </button>
              </div>
            ) : (
              <p className={`mt-6 text-center text-sm text-slate-500`}>{t('category.noCourses')}</p>
            )}
          </section>
        </div>
      </PageShell>
    </>
  )
}
