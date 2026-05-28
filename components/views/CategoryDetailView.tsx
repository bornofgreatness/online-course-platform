'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../PageShell'
import CourseListCard from '../CourseListCard'
import { useI18n } from '../LanguageProvider'
import { translateCategoryName } from '../../lib/i18n/translations'
import { catalogNavRowClass } from '../CatalogSidebar'

type CourseRow = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  workloadHours: number
}

type CategoryData = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  courses: CourseRow[]
  subcategories: { id: string; name: string; courses: CourseRow[] }[]
}

export default function CategoryDetailView({
  category,
  initialSubcategoryId = '',
}: {
  category: CategoryData | null
  initialSubcategoryId?: string
}) {
  const { t } = useI18n()
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(initialSubcategoryId)

  const uncategorizedCourses = useMemo(() => {
    if (!category) return []
    const inSub = new Set(category.subcategories.flatMap((s) => s.courses.map((c) => c.id)))
    return category.courses.filter((c) => !inSub.has(c.id))
  }, [category])

  useEffect(() => {
    if (!category?.subcategories.length) {
      setSelectedSubcategoryId('')
      return
    }
    if (
      initialSubcategoryId &&
      (initialSubcategoryId === '__uncategorized__' ||
        category.subcategories.some((s) => s.id === initialSubcategoryId))
    ) {
      setSelectedSubcategoryId(initialSubcategoryId)
      return
    }
    const firstWithCourses = category.subcategories.find((s) => s.courses.length > 0)
    setSelectedSubcategoryId(firstWithCourses?.id ?? category.subcategories[0].id)
  }, [category?.id, category?.subcategories, initialSubcategoryId])

  if (!category?.id) {
    return (
      <PageShell>
        <p className={siteMutedClass}>{t('category.notFound')}</p>
        <Link href="/categories" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
          ← {t('common.allCategories')}
        </Link>
      </PageShell>
    )
  }

  const displayName = translateCategoryName(category.name, t)

  const selectedSub = category.subcategories.find((s) => s.id === selectedSubcategoryId)
  const displayedCourses =
    category.subcategories.length > 0
      ? selectedSubcategoryId === '__uncategorized__'
        ? uncategorizedCourses
        : (selectedSub?.courses ?? [])
      : category.courses

  const panelTitle =
    selectedSubcategoryId === '__uncategorized__'
      ? t('category.uncategorized')
      : selectedSub?.name ?? displayName

  const totalCourses =
    category.subcategories.length > 0
      ? category.subcategories.reduce((n, s) => n + s.courses.length, 0) + uncategorizedCourses.length
      : category.courses.length

  return (
    <PageShell>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-900">{t('common.category')}</p>
          <h1 className={`${siteTitleClass} mt-1`}>{displayName}</h1>
          <p className={`${siteMutedClass} mt-2`}>
            {t('category.coursesInCategory', { count: totalCourses })}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/categories" className="text-blue-600 hover:underline">
            {t('common.allCategories')}
          </Link>
          <Link href="/courses" className="text-blue-600 hover:underline">
            {t('common.allCourses')}
          </Link>
        </div>
      </div>

      {category.imageUrl ? (
        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={category.imageUrl} alt="" className="max-h-48 w-full object-cover" />
        </div>
      ) : null}

      {category.subcategories.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900">
              {t('common.subcategories')}
            </h2>
            <nav className="flex max-h-[min(70vh,560px)] flex-col gap-0.5 overflow-y-auto">
              {category.subcategories.map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => setSelectedSubcategoryId(sub.id)}
                  className={catalogNavRowClass(selectedSubcategoryId === sub.id)}
                >
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900">
                    {sub.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">{sub.courses.length}</span>
                </button>
              ))}
              {uncategorizedCourses.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedSubcategoryId('__uncategorized__')}
                  className={catalogNavRowClass(selectedSubcategoryId === '__uncategorized__')}
                >
                  <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-900">
                    {t('category.uncategorized')}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-500">{uncategorizedCourses.length}</span>
                </button>
              ) : null}
            </nav>
          </aside>

          <section>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">{panelTitle}</h2>
            <p className={`${siteMutedClass} mt-1 text-sm`}>
              {displayedCourses.length}{' '}
              {displayedCourses.length === 1 ? t('common.course') : t('common.coursesCount')}
            </p>
            {displayedCourses.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayedCourses.map((course) => (
                  <CourseListCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className={`${siteCardClass} mt-4 p-10 text-center ${siteMutedClass}`}>
                {t('category.noCoursesSub')}
              </div>
            )}
          </section>
        </div>
      ) : category.courses.length === 0 ? (
        <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>{t('category.noCourses')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {category.courses.map((course) => (
            <CourseListCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
