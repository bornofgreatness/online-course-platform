import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SessionProvider from '../components/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Online Course Platform',
  description: 'Professional online course platform for PDF-based educational content',
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