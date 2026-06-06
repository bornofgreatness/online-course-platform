'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import PageShell, { siteCardClass, siteLinkClass, siteMutedClass, siteTitleClass } from '../PageShell'
import CategoryListCard from '../CategoryListCard'
import { useI18n } from '../LanguageProvider'

type Category = {
  id: string
  name: string
  icon: string | null
  imageUrl: string | null
  _count: { courses: number }
  subcategories: { id: string; name: string; _count: { courses: number } }[]
}

export default function CategoriesView({ categories }: { categories: Category[] }) {
  const { t } = useI18n()
  const orderedCategories = useMemo(() => {
    const withSubs = categories.filter((cat) => (cat.subcategories?.length || 0) > 0)
    const withoutSubs = categories.filter((cat) => (cat.subcategories?.length || 0) === 0)
    return [...withSubs, ...withoutSubs]
  }, [categories])

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className={siteTitleClass}>{t('common.categories')}</h1>
        <p className={`${siteMutedClass} mt-2 max-w-2xl`}>{t('category.browseIntro')}</p>
      </div>

      {orderedCategories.length === 0 ? (
        <div className={`${siteCardClass} p-10 text-center ${siteMutedClass}`}>{t('category.noCourses')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedCategories.map((cat) => (
            <CategoryListCard key={cat.id} category={cat} />
          ))}
        </div>
      )}

      <p className="mt-10">
        <Link href="/courses" className={siteLinkClass}>
          ← {t('common.allCourses')}
        </Link>
      </p>
    </PageShell>
  )
}
