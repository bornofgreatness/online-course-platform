import type { Metadata } from 'next'
import type { Language } from '../i18n/translations'
import { getSeoKeywordsString, SEO_KEYWORDS_COMBINED_STRING } from './keywords'
import { SEO_HREFLANG, SEO_LANDING_PATH_EN, SEO_LANDING_PATH_PT } from './paths'

export const SITE_NAME = 'CONECT CURSOS'

export const SITE_TAGLINE_PT = 'Plataforma de cursos online com certificado digital'
export const SITE_TAGLINE_EN = 'Online course platform with digital certificates'

export const DEFAULT_DESCRIPTION_PT =
  'CONECT CURSOS: plataforma de cursos online rápidos com certificado digital de 100 horas, válido em todo o Brasil. Administração, TI, saúde, marketing, idiomas e mais. Preços acessíveis em reais (R$).'

export const DEFAULT_DESCRIPTION_EN =
  'CONECT CURSOS: fast online courses with 100-hour digital certificates valid across Brazil. Business, IT, health, marketing, languages and more. Affordable subscription in BRL (R$).'

export const DEFAULT_DESCRIPTION = DEFAULT_DESCRIPTION_PT

type PageMetaOptions = {
  title: string
  description?: string
  path?: string
  locale?: Language
  noIndex?: boolean
  /** Add pt-BR / en hreflang alternates for the SEO landing pages. */
  seoAlternates?: boolean
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  locale = 'pt',
  noIndex = false,
  seoAlternates = false,
}: PageMetaOptions): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const resolvedDescription =
    description ?? (locale === 'en' ? DEFAULT_DESCRIPTION_EN : DEFAULT_DESCRIPTION_PT)
  const keywords =
    path === SEO_LANDING_PATH_PT || path === SEO_LANDING_PATH_EN
      ? getSeoKeywordsString(locale)
      : SEO_KEYWORDS_COMBINED_STRING

  const alternates: Metadata['alternates'] = {
    canonical: path || '/',
  }

  if (seoAlternates) {
    alternates.languages = { ...SEO_HREFLANG }
  }

  return {
    title: fullTitle,
    description: resolvedDescription,
    keywords,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'pt_BR',
      alternateLocale: locale === 'en' ? ['pt_BR'] : ['en_US'],
      siteName: SITE_NAME,
      title: fullTitle,
      description: resolvedDescription,
      url: path || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: resolvedDescription,
    },
    alternates,
  }
}
