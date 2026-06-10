'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import PageShell from '../../components/PageShell'
import {
  siteMobileQuickAccentClass,
  siteMobileQuickOutlineClass,
  siteMobileQuickPrimaryClass,
  siteMobileQuickStackClass,
  sitePanelClass,
} from '../../lib/ui/siteStyles'
import PageLoading from '../../components/PageLoading'
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

function CourseSearchInput({
  id,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  id?: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-slate-400"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  )
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
  const [loading, setLoading] = useState(true)
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
      .finally(() => setLoading(false))
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

  const scrollToCourses = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 1023px)').matches) return
    coursesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedCategoryId('')
    setSelectedSubcategoryId('')
  }, [])

  const selectCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId)
      setSelectedSubcategoryId('')
      const cat = catalogCategories.find((c) => c.id === categoryId)
      if (cat && cat.subcategories.length === 0) {
        queueMicrotask(() => scrollToCourses())
      }
    },
    [catalogCategories, scrollToCourses]
  )

  const selectSubcategory = useCallback(
    (categoryId: string, subcategoryId: string) => {
      setSelectedCategoryId(categoryId)
      setSelectedSubcategoryId(subcategoryId)
      setExpandedCategoryIds((prev) => new Set(prev).add(categoryId))
      queueMicrotask(() => scrollToCourses())
    },
    [scrollToCourses]
  )

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

  if (loading) {
    return <PageLoading label={t('common.loading')} />
  }

  return (
    <>
      <Header />

      <PageShell className="pt-2 lg:pt-6">
        <div className="lg:hidden">
          <div className="py-4">
            <div className={`${sitePanelClass} !p-3`}>
              <nav className={siteMobileQuickStackClass} aria-label={t('course.available')}>
                <button type="button" onClick={scrollToCourses} className={siteMobileQuickPrimaryClass}>
                  <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {t('course.available')}
                </button>
                {status !== 'loading' && session ? (
                  <Link href="/dashboard" className={siteMobileQuickAccentClass}>
                    <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t('common.dashboard')}
                  </Link>
                ) : (
                  <Link href="/auth/signin" className={siteMobileQuickAccentClass}>
                    <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {t('common.loginSignup')}
                  </Link>
                )}
                <Link href="/certificates" className={siteMobileQuickOutlineClass}>
                  <svg className="h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {t('common.certificates')}
                </Link>
              </nav>
            </div>
            <div className="mt-3">
              <label htmlFor="courses-mobile-search" className="sr-only">
                {t('course.search')}
              </label>
              <CourseSearchInput
                id="courses-mobile-search"
                placeholder={t('course.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="px-0 pb-2">
            <h2 className="mb-2 text-base font-bold text-slate-900">{t('common.categories')}</h2>
            <div className={`overflow-y-auto p-2 ${sitePanelClass}`}>
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
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className={`hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-auto lg:block lg:sticky lg:top-24 ${sitePanelClass}`}>
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
              <CourseSearchInput
                placeholder={t('course.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-xs md:max-w-sm"
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
