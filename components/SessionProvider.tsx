'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { LanguageProvider } from './LanguageProvider'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </NextAuthSessionProvider>
  )
}
