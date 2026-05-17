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
    default: 'Plataforma de Cursos Online',
    template: '%s | Plataforma de Cursos Online',
  },
  description:
    'Mais de 140 cursos com certificado de 100 horas. Educação, informática, IA, saúde, marketing e mais. Assinatura em reais (R$).',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Plataforma de Cursos Online',
    title: 'Plataforma de Cursos Online',
    description: 'Cursos online, certificados, quizzes e assinatura com acesso a todo o catálogo.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plataforma de Cursos Online',
    description: 'Cursos online, certificados e assinatura em BRL.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-100 antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
