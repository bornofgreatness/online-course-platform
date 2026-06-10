'use client'

import Link from 'next/link'
import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import { useI18n } from './LanguageProvider'
import { translateCategoryName } from '../lib/i18n/translations'
import { siteCardClass, siteCardHoverClass, sitePrimaryBtnClass } from '../lib/ui/siteStyles'

type Category = {
  id: string
  name: string
  icon?: string | null
  imageUrl?: string | null
  _count: { courses: number }
  subcategories?: { id: string; name: string; _count: { courses: number } }[]
}

export default function CategoryListCard({ category }: { category: Category }) {
  const { t } = useI18n()
  const imageUrl = category.imageUrl?.trim() || null
  const subs = category.subcategories ?? []
  const n =
    subs.length > 0
      ? subs.reduce((sum, s) => sum + s._count.courses, 0)
      : category._count.courses
  const displayName = translateCategoryName(category.name, t)
  const footerLabel =
    n === 1 ? `1 ${t('common.course')}` : `${n} ${t('common.coursesCount')}`
  const metaLabel =
    subs.length > 0
      ? t('landing.subcategoriesCourses', { subs: subs.length, courses: n })
      : null

  const blurb =
    n === 0
      ? t('category.emptySoon')
      : t('category.browseUnder', { name: displayName })

  return (
    <article className={`flex h-32 flex-row overflow-hidden sm:h-40 ${siteCardClass} ${siteCardHoverClass}`}>
      <div className="flex flex-shrink-0 items-center justify-center" style={{ width: '60%', minWidth: '120px', maxWidth: '180px' }}>
        <div className="ml-1.5 mr-3 h-[calc(100%-16px)] w-[calc(100%-18px)] overflow-hidden rounded-lg sm:rounded-xl">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 text-teal-700">
              <CourseCategorySidebarIcon categoryName={category.name} icon={category.icon} />
            </div>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2 sm:pr-2.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h2 className="line-clamp-1 text-sm font-bold leading-tight text-blue-950 sm:text-base">
              {displayName}
            </h2>
          </div>
          {metaLabel ? (
            <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-slate-500 sm:text-xs">{metaLabel}</p>
          ) : null}
          <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-slate-600 sm:text-xs">{blurb}</p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1.5">
          <span className="truncate text-[10px] font-semibold text-slate-600 sm:text-xs">{footerLabel}</span>
          <Link
            href={`/categories/${category.id}`}
            className={`shrink-0 px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1.5 sm:text-xs ${sitePrimaryBtnClass}`}
          >
            {t('category.viewCategory')}
          </Link>
        </div>
      </div>
    </article>
  )
}
