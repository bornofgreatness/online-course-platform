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

export const adminCardClass =
  'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6'

export const adminStatCardClass =
  'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-black/5'

export const adminInputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20'

export const adminSelectClass = adminInputClass

export const adminTableWrapClass =
  '-mx-4 overflow-x-auto rounded-xl border border-slate-200/80 sm:mx-0'

export const adminTableClass = 'min-w-[720px] w-full text-sm'

export const adminPrimaryBtnClass =
  'inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'

export const adminSecondaryBtnClass =
  'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'

export const adminDangerBtnClass =
  'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'

export const adminListItemClass =
  'flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 sm:flex-row sm:items-center sm:justify-between'

export function adminTabButtonClass(active: boolean) {
  return [
    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
    active
      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800',
  ].join(' ')
}
