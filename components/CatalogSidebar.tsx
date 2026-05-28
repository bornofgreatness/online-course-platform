'use client'

import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import { useI18n } from './LanguageProvider'
import { translateCategoryName } from '../lib/i18n/translations'

export type CatalogSubcategoryItem = {
  id: string
  name: string
  courseCount?: number
}

export type CatalogCategoryItem = {
  id: string
  name: string
  icon?: string | null
  subcategories: CatalogSubcategoryItem[]
}

type Props = {
  categories: CatalogCategoryItem[]
  selectedCategoryId: string
  selectedSubcategoryId: string
  onSelectAll: () => void
  onSelectCategory: (categoryId: string) => void
  onSelectSubcategory: (categoryId: string, subcategoryId: string) => void
  expandedCategoryIds: Set<string>
  onToggleCategory: (categoryId: string) => void
  className?: string
}

export function catalogNavRowClass(active: boolean, indented = false) {
  return [
    'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition',
    indented ? 'pl-9' : '',
    active ? 'border-l-4 border-teal-700 bg-teal-50 pl-2' : 'border-l-4 border-transparent hover:bg-gray-50',
  ].join(' ')
}

export default function CatalogSidebar({
  categories,
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectAll,
  onSelectCategory,
  onSelectSubcategory,
  expandedCategoryIds,
  onToggleCategory,
  className = '',
}: Props) {
  const { t } = useI18n()
  const categoriesWithSubcategories = categories.filter((cat) => cat.subcategories.length > 0)
  const categoriesWithoutSubcategories = categories.filter((cat) => cat.subcategories.length === 0)
  const orderedCategories = [...categoriesWithSubcategories, ...categoriesWithoutSubcategories]

  return (
    <nav className={`flex flex-col gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={onSelectAll}
        className={catalogNavRowClass(!selectedCategoryId && !selectedSubcategoryId)}
      >
        <CourseCategorySidebarIcon categoryName={null} />
        <span className="text-sm font-bold leading-tight text-black">{t('common.allCategories')}</span>
      </button>

      {orderedCategories.map((cat) => {
        const displayName = translateCategoryName(cat.name, t)
        const expanded = expandedCategoryIds.has(cat.id)
        const hasSubs = cat.subcategories.length > 0
        const categoryOnlyActive = selectedCategoryId === cat.id && !selectedSubcategoryId

        return (
          <div key={cat.id} className="flex flex-col">
            <div className="flex items-stretch gap-0.5">
              {hasSubs ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => onToggleCategory(cat.id)}
                  className="flex w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-gray-100"
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M7 5l6 5-6 5V5z" />
                  </svg>
                </button>
              ) : (
                <span className="w-8 shrink-0" aria-hidden />
              )}
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`${catalogNavRowClass(categoryOnlyActive)} min-w-0 flex-1`}
              >
                <CourseCategorySidebarIcon categoryName={cat.name} icon={cat.icon} />
                <span className="truncate text-sm font-bold leading-tight text-black">{displayName}</span>
              </button>
            </div>

            {hasSubs && expanded && (
              <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-slate-200 pl-1">
                {cat.subcategories.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => onSelectSubcategory(cat.id, sub.id)}
                    className={catalogNavRowClass(
                      selectedCategoryId === cat.id && selectedSubcategoryId === sub.id,
                      true
                    )}
                  >
                    <span className="truncate text-sm font-medium text-slate-800">{sub.name}</span>
                    {typeof sub.courseCount === 'number' ? (
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-slate-500">{sub.courseCount}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
