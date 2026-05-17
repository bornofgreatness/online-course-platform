const appName = 'Plataforma de Cursos Online'

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
    '@type': 'Organization',
    name: appName,
    url,
    description:
      'Mais de 140 cursos online com certificado de 100 horas. Educação, tecnologia, IA, saúde, marketing e mais.',
  }
}

export function websiteJsonLd() {
  const url = appBaseUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appName,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/courses?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
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
    provider: { '@type': 'Organization', name: appName },
    educationalLevel: 'Professional',
    timeRequired: `PT${course.workloadHours}H`,
    courseMode: 'online',
    inLanguage: 'pt-BR',
    about: course.categoryName,
    url,
    image: course.thumbnailUrl || undefined,
  }
}
