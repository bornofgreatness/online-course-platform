import { appBaseUrl } from '../structuredData'
import { SITE_NAME } from './metadata'

export type FaqItem = { question: string; answer: string }

export function faqPageJsonLd(items: FaqItem[], pagePath: string) {
  const url = `${appBaseUrl()}${pagePath}`
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url,
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }
}
