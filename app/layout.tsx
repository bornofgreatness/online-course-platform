import type { Metadata } from 'next'
import SessionProvider from '../components/SessionProvider'
import {
  educationalServiceJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '../lib/structuredData'
import {
  DEFAULT_DESCRIPTION_EN,
  DEFAULT_DESCRIPTION_PT,
  SITE_NAME,
  SITE_TAGLINE_PT,
} from '../lib/seo/metadata'
import { SEO_KEYWORDS_COMBINED_STRING } from '../lib/seo/keywords'
import { SEO_HREFLANG } from '../lib/seo/paths'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE_PT}`,
    template: `%s`,
  },
  description: `${DEFAULT_DESCRIPTION_PT} ${DEFAULT_DESCRIPTION_EN}`,
  keywords: SEO_KEYWORDS_COMBINED_STRING,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['en_US'],
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION_PT,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION_PT,
  },
  alternates: {
    languages: { ...SEO_HREFLANG },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = [organizationJsonLd(), websiteJsonLd(), educationalServiceJsonLd()]

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-slate-100 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
