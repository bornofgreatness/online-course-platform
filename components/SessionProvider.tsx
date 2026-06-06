'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { LanguageProvider } from './LanguageProvider'
import NavigationLoading from './NavigationLoading'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <LanguageProvider>
        {children}
        <NavigationLoading />
      </LanguageProvider>
    </NextAuthSessionProvider>
  )
}
