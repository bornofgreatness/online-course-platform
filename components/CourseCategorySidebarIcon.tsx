import type { ReactNode } from 'react'

const base = {
  className: 'h-6 w-6 shrink-0 text-black',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

function IconAllCategories() {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconLaptop() {
  return (
    <svg {...base}>
      <rect x="4" y="5" width="16" height="10" rx="1.5" />
      <path d="M2 18h20" />
      <path d="M8 15h8" />
    </svg>
  )
}

function IconDesign() {
  return (
    <svg {...base}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 17l3-3 2 2 4-4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconMegaphone() {
  return (
    <svg {...base}>
      <path d="M3 11V9h3l5-2v10l-5-2H3v-2" />
      <path d="M16 9a4 4 0 0 1 0 6" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

function IconBusiness() {
  return (
    <svg {...base}>
      <rect x="4" y="6" width="16" height="12" rx="1" />
      <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
      <path d="M12 11v3M10 14h4" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg {...base}>
      <path d="M9 4h6l2 2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-2z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

function IconHealth() {
  return (
    <svg {...base}>
      <path d="M12 21s-6.5-4.2-6.5-9.5A4.5 4.5 0 0 1 15 7.2L12 10l-3-2.8A4.5 4.5 0 0 1 18.5 11.5C18.5 16.8 12 21 12 21z" />
    </svg>
  )
}

function IconPalette() {
  return (
    <svg {...base}>
      <path d="M12 3a7 7 0 0 0-7 7c0 2 1 4 3 5.5.5.4 1.2.5 1.8.3l1.5-.6a2 2 0 0 1 2.4.4l.3.3" />
      <circle cx="6.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="5.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="9" r="1" fill="currentColor" stroke="none" />
      <path d="M15 14h6a1 1 0 0 1 1 1v0a3 3 0 0 1-3 3h-2" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg {...base}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </svg>
  )
}

function IconFolder() {
  return (
    <svg {...base}>
      <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    </svg>
  )
}

const ICON_BY_KEY: Record<string, ReactNode> = {
  laptop: <IconLaptop />,
  tech: <IconLaptop />,
  design: <IconDesign />,
  marketing: <IconMegaphone />,
  megaphone: <IconMegaphone />,
  globe: <IconGlobe />,
  language: <IconGlobe />,
  business: <IconBusiness />,
  camera: <IconCamera />,
  health: <IconHealth />,
  palette: <IconPalette />,
  art: <IconPalette />,
  document: <IconDocument />,
  pdf: <IconDocument />,
  folder: <IconFolder />,
  all: <IconAllCategories />,
  grid: <IconAllCategories />,
}

function IconFromStoredKey(icon: string): ReactNode | null {
  const k = icon.trim().toLowerCase()
  return ICON_BY_KEY[k] ?? null
}

function heuristicFromName(categoryName: string): ReactNode {
  const n = categoryName.toLowerCase()
  if (n.includes('technology') || n.includes('program') || n.includes('tech') || n.includes('web'))
    return <IconLaptop />
  if (n.includes('design') || n.includes('digital') || n.includes('ux') || n.includes('ui'))
    return <IconDesign />
  if (n.includes('market')) return <IconMegaphone />
  if (n.includes('language') || n.includes('idiom')) return <IconGlobe />
  if (n.includes('business') || n.includes('financ') || n.includes('negócio')) return <IconBusiness />
  if (n.includes('photo') || n.includes('video') || n.includes('film')) return <IconCamera />
  if (n.includes('health') || n.includes('well') || n.includes('saúde')) return <IconHealth />
  if (n.includes('art') || n.includes('creativ') || n.includes('arte')) return <IconPalette />
  if (n.includes('pdf') || n.includes('product')) return <IconDocument />
  return <IconFolder />
}

/** Monochrome sidebar icon; empty / null name means “all categories”. Stored `icon` overrides name heuristics. */
export function CourseCategorySidebarIcon({
  categoryName,
  icon,
}: {
  categoryName?: string | null
  icon?: string | null
}) {
  const rawIcon = (icon ?? '').trim()
  if (rawIcon) {
    const fromKey = IconFromStoredKey(rawIcon)
    if (fromKey) return fromKey
    if (!/^[a-z_]+$/i.test(rawIcon)) {
      return (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-lg leading-none text-black"
          aria-hidden
        >
          {rawIcon}
        </span>
      )
    }
  }

  const c = (categoryName ?? '').trim()
  if (!c) return <IconAllCategories />
  return heuristicFromName(c)
}
