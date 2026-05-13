import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionProvider from '../components/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: {
    default: 'Online Course Platform',
    template: '%s | Online Course Platform',
  },
  description: 'Professional online course platform for PDF-based educational content, subscriptions, and certificates.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Online Course Platform',
    title: 'Online Course Platform',
    description: 'PDF courses, quizzes, certificates, and subscriptions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Course Platform',
    description: 'PDF courses, quizzes, certificates, and subscriptions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={`${inter.className} bg-slate-100 antialiased`}>{children}</body>
      </SessionProvider>
    </html>
  )
}