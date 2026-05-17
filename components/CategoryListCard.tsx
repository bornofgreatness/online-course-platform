'use client'

import Link from 'next/link'
import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import { useI18n } from './LanguageProvider'
import { translateCategoryName } from '../lib/i18n/translations'

type Category = {
  id: string
  name: string
  icon?: string | null
  imageUrl?: string | null
  _count: { courses: number }
}

export default function CategoryListCard({ category }: { category: Category }) {
  const { t } = useI18n()
  const imageUrl = category.imageUrl?.trim() || null
  const n = category._count.courses
  const displayName = translateCategoryName(category.name, t)
  const footerLabel =
    n === 1 ? `1 ${t('common.course')}` : `${n} ${t('common.coursesCount')}`

  const blurb =
    n === 0
      ? t('category.emptySoon')
      : t('category.browseUnder', { name: displayName })

  return (
    <Link
      href={`/categories/${category.id}`}
      className="group flex flex-row overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
    >
      <div className="relative flex min-h-[112px] w-[34%] min-w-[100px] max-w-[130px] shrink-0 items-center justify-center self-stretch overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:min-h-[168px] sm:w-[40%] sm:max-w-[220px] sm:rounded-l-xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="scale-110 text-black sm:scale-125">
            <CourseCategorySidebarIcon categoryName={category.name} icon={category.icon} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
        <div>
          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-blue-950 sm:text-base group-hover:text-blue-800">
            {displayName}
          </h2>
          <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 lg:line-clamp-2 lg:block">{blurb}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
          <span className="text-base font-bold tabular-nums text-blue-950 sm:text-lg">{footerLabel}</span>
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white sm:px-4 sm:py-2.5 sm:text-xs">
            {t('category.viewCategory')}
          </span>
        </div>
      </div>
    </Link>
  )
}
