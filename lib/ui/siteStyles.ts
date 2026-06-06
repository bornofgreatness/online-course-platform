/** Shared visual tokens for the public-facing app. */

export const sitePageBg =
  'min-h-screen bg-gradient-to-b from-slate-100 via-slate-50/90 to-slate-100'

export const siteShellPadding = 'px-4 pb-10 pt-4 lg:px-8 lg:pb-10 lg:pt-6'

export const siteCardClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/5'

export const siteCardHoverClass =
  'transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60'

export const siteTitleClass = 'text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl'

export const siteEyebrowClass =
  'text-xs font-bold uppercase tracking-[0.18em] text-teal-700'

export const siteMutedClass = 'text-sm leading-relaxed text-slate-600 sm:text-base'

export const siteInputClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'

export const siteLabelClass = 'block text-sm font-medium text-slate-700'

export const siteSearchInputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

export const sitePrimaryBtnClass =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60'

export const siteSecondaryBtnClass =
  'inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60'

export const siteAccentBtnClass =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60'

export const siteDarkBtnClass =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-60'

export const siteMobileActionClass =
  'block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wide shadow-md transition'

export const siteLinkClass =
  'text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline'

export const siteHeroGradient = 'bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 text-white'

export const siteHeroBtnPrimary =
  'rounded-full bg-white px-8 py-3 text-sm font-bold uppercase tracking-wide text-blue-950 shadow-lg transition hover:bg-teal-50'

export const siteHeroBtnSecondary =
  'rounded-full border-2 border-white/70 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/10'

export const sitePanelClass =
  'rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-sm sm:p-5'

export const siteStatCardClass = `${siteCardClass} p-4 sm:p-5`

export const siteSectionTitleClass =
  'text-xs font-bold uppercase tracking-[0.14em] text-blue-900 sm:text-sm'

export const siteInsetPanelClass =
  'rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 to-white p-4 sm:p-5'

export const sitePageHeroClass =
  'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-teal-800 p-5 text-white shadow-lg ring-1 ring-black/10 sm:p-6 lg:p-8'

export const siteAlertSuccessClass =
  'rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm'

export const siteAlertErrorClass =
  'rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-sm'

export const siteBadgeActiveClass =
  'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'

export const siteBadgePendingClass =
  'inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800'

export function siteStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'succeeded' || normalized === 'paid' || normalized === 'active') {
    return 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800'
  }
  if (normalized === 'pending') {
    return 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800'
  }
  return 'inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600'
}
