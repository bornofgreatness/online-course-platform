'use client'

import Link from 'next/link'
import PageShell, { siteCardClass, siteMutedClass, siteTitleClass } from '../PageShell'
import CourseListCard from '../CourseListCard'
import { useI18n } from '../LanguageProvider'
import { translateCategoryName } from '../../lib/i18n/translations'

type CourseRow = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
}

type CategoryData = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  courses: CourseRow[]
  subcategories: { id: string; name: string; courses: CourseRow[] }[]
}

export default function CategoryDetailView({ category }: { category: CategoryData | null }) {
  const { t } = useI18n()

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

  const totalCourses =
    category.subcategories.length > 0
      ? category.subcategories.reduce((n, s) => n + s.courses.length, 0) +
        category.courses.filter(
          (c) => !category.subcategories.some((s) => s.courses.some((sc) => sc.id === c.id))
        ).length
      : category.courses.length

  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        <div className="mb-8 overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={category.imageUrl} alt="" className="max-h-56 w-full object-cover" />
        </div>
      ) : null}

      {category.subcategories.length > 0 ? (
        <div className="space-y-10">
          {category.subcategories.map((sub) => (
            <section key={sub.id}>
              <h2 className="text-lg font-bold text-slate-900">{sub.name}</h2>
              <p className={`${siteMutedClass} mt-1 text-sm`}>
                {sub.courses.length}{' '}
                {sub.courses.length === 1 ? t('common.course') : t('common.coursesCount')}
              </p>
              {sub.courses.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sub.courses.map((course) => (
                    <CourseListCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <p className={`${siteMutedClass} mt-3 text-sm`}>{t('category.noCoursesSub')}</p>
              )}
            </section>
          ))}
          {(() => {
            const inSub = new Set(
              category.subcategories.flatMap((s) => s.courses.map((c) => c.id))
            )
            const uncategorized = category.courses.filter((c) => !inSub.has(c.id))
            if (uncategorized.length === 0) return null
            return (
              <section>
                <h2 className="text-lg font-bold text-slate-900">{t('category.uncategorized')}</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {uncategorized.map((course) => (
                    <CourseListCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )
          })()}
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
