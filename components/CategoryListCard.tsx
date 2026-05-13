import Link from 'next/link'
import { CourseCategorySidebarIcon } from './CourseCategorySidebarIcon'
import { getCategoryListCardDisplay, initialsFromName } from '../lib/courseCardDisplay'

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
      <svg className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">{value.toFixed(1)}</span>
    </div>
  )
}

type Category = {
  id: string
  name: string
  icon?: string | null
  imageUrl?: string | null
  _count: { courses: number }
}

/** Same horizontal card layout as course catalog; links to category detail. */
export default function CategoryListCard({ category }: { category: Category }) {
  const d = getCategoryListCardDisplay(category.id, category._count.courses)
  const initials = initialsFromName(category.name)
  const imageUrl = category.imageUrl?.trim() || null

  const blurb =
    category._count.courses === 0
      ? 'No courses yet — check back soon.'
      : `Browse every course filed under ${category.name}.`

  return (
    <Link
      href={`/categories/${category.id}`}
      className="group flex flex-row overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5 transition hover:shadow-lg"
    >
      <div className="relative flex min-h-[112px] w-[34%] min-w-[100px] max-w-[130px] shrink-0 items-center justify-center self-stretch overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:min-h-[168px] sm:w-[40%] sm:max-w-[220px] sm:rounded-l-xl">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="scale-110 text-black sm:scale-125">
            <CourseCategorySidebarIcon categoryName={category.name} icon={category.icon} />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 text-sm font-bold leading-snug text-blue-950 sm:text-base group-hover:text-blue-800">
              {category.name}
            </h2>
            <StarRating value={d.rating} />
          </div>
          <p className="mt-2 hidden text-sm leading-relaxed text-slate-600 lg:line-clamp-2 lg:block">{blurb}</p>
          <div className="mt-2 flex items-center gap-2 sm:mt-3 sm:gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-9 sm:w-9 sm:text-xs ${d.avatarClass}`}
            >
              {initials}
            </div>
            <span className="truncate text-xs font-medium text-slate-800 sm:text-sm">{d.curator}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
          <span className="text-base font-bold tabular-nums text-blue-950 sm:text-lg">{d.footerLabel}</span>
          <span className="rounded-lg bg-blue-600 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-white sm:px-4 sm:py-2.5 sm:text-xs">
            View category
          </span>
        </div>
      </div>
    </Link>
  )
}
