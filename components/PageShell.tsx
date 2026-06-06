import type { ReactNode } from 'react'
import {
  siteCardClass,
  siteEyebrowClass,
  siteInputClass,
  siteLabelClass,
  siteLinkClass,
  siteMutedClass,
  sitePageBg,
  sitePrimaryBtnClass,
  siteSearchInputClass,
  siteSecondaryBtnClass,
  siteShellPadding,
  siteTitleClass,
} from '../lib/ui/siteStyles'

export {
  siteAlertErrorClass,
  siteAlertSuccessClass,
  siteBadgeActiveClass,
  siteBadgePendingClass,
  siteCardClass,
  siteCardHoverClass,
  siteEyebrowClass,
  siteInsetPanelClass,
  siteInputClass,
  siteLabelClass,
  siteLinkClass,
  siteMutedClass,
  sitePageHeroClass,
  sitePanelClass,
  sitePrimaryBtnClass,
  siteSearchInputClass,
  siteSecondaryBtnClass,
  siteSectionTitleClass,
  siteStatCardClass,
  siteStatusBadgeClass,
  siteTitleClass,
} from '../lib/ui/siteStyles'

/** Shared page background and horizontal padding (matches courses listing). */
export default function PageShell({
  children,
  className = '',
  centered = false,
}: {
  children: ReactNode
  className?: string
  /** Vertically center content (auth-style pages). */
  centered?: boolean
}) {
  const base = `${sitePageBg} ${siteShellPadding} ${className}`
  if (centered) {
    return (
      <div
        className={`${base} flex flex-col items-center justify-start py-10 sm:justify-center sm:py-12`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    )
  }
  return <div className={base}>{children}</div>
}
