import { DEFAULT_DESCRIPTION_EN, DEFAULT_DESCRIPTION_PT, SITE_NAME } from './seo/metadata'

export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  ).replace(/\/$/, '')
}

export function organizationJsonLd() {
  const url = appBaseUrl()
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION_PT,
    alternateName: SITE_NAME,
    areaServed: 'BR',
    knowsLanguage: ['pt-BR', 'en'],
  }
}

export function websiteJsonLd() {
  const url = appBaseUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: DEFAULT_DESCRIPTION_PT,
    inLanguage: ['pt-BR', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/courses?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function educationalServiceJsonLd() {
  const url = appBaseUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'Cursos online com certificado digital',
    description: DEFAULT_DESCRIPTION_EN,
    provider: { '@type': 'Organization', name: SITE_NAME, url },
    occupationalCategory: 'Professional development',
    programType: 'Online course',
    url: `${url}/cursos-online-com-certificado`,
    availableLanguage: ['pt-BR', 'en'],
    areaServed: { '@type': 'Country', name: 'Brazil' },
  }
}

export function courseJsonLd(course: {
  id: string
  title: string
  description: string
  workloadHours: number
  thumbnailUrl?: string | null
  categoryName: string
}) {
  const url = `${appBaseUrl()}/courses/${course.id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: { '@type': 'Organization', name: SITE_NAME },
    educationalLevel: 'Professional',
    timeRequired: `PT${course.workloadHours}H`,
    courseMode: 'online',
    inLanguage: 'pt-BR',
    about: course.categoryName,
    url,
    image: course.thumbnailUrl || undefined,
  }
}
