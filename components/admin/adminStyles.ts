import {
  siteCardClass,
  siteInputClass,
  sitePrimaryBtnClass,
  siteSecondaryBtnClass,
} from '../../lib/ui/siteStyles'

export type AdminTab =
  | 'categories'
  | 'courses'
  | 'marketing'
  | 'affiliates'
  | 'users'
  | 'payments'
  | 'subscriptions'
  | 'certificates'
  | 'quizzes'
  | 'reports'

export const adminShellClass = 'mx-auto w-full min-w-0 max-w-6xl'

export const adminCardClass = `${siteCardClass} p-4 sm:p-6`

export const adminStatCardClass =
  `${siteCardClass} border-t-4 border-t-blue-600 p-3 sm:p-4`

export const adminHeroClass =
  'relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-900 p-4 text-white shadow-lg ring-1 ring-black/10 sm:mb-6 sm:p-6'

export const adminReportCardClass =
  'rounded-xl border border-slate-200/80 bg-slate-50 p-3 shadow-sm sm:p-4'

export const adminSectionTitleClass = 'text-lg font-semibold text-slate-900 sm:text-xl'

export const adminSectionHeaderClass =
  'mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'

export const adminInputClass = siteInputClass

export const adminSelectClass = siteInputClass

export const adminSearchInputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

export const adminTableWrapClass =
  'overflow-x-auto rounded-xl border border-slate-200/80 bg-white'

export const adminTableClass = 'min-w-[720px] w-full text-sm'

export const adminMobileListClass = 'space-y-3'

export const adminMobileCardClass =
  'rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.03]'

export const adminActionBtnClass =
  'inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto'

export const adminDangerBtnClass =
  'inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto'

export const adminPrimaryBtnClass = sitePrimaryBtnClass

export const adminSecondaryBtnClass = siteSecondaryBtnClass

export function adminTabButtonClass(active: boolean) {
  return [
    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
    active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800',
  ].join(' ')
}
