import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { canAccessAdminPanel } from './lib/auth/rbac'

function withReferralCookie(request: NextRequest, response: NextResponse) {
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && ref.trim().length >= 4) {
    response.cookies.set('referral_code', ref.trim(), {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const authRequiredPrefixes = ['/dashboard', '/admin', '/affiliate']
  const isAuthRequired = authRequiredPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (!isAuthRequired) {
    return withReferralCookie(request, NextResponse.next())
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.email) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('callbackUrl', pathname)
    return withReferralCookie(request, NextResponse.redirect(url))
  }

  if (pathname.startsWith('/admin')) {
    const role = (token as { role?: string }).role
    if (!canAccessAdminPanel(role)) {
      return withReferralCookie(request, NextResponse.redirect(new URL('/', request.url)))
    }
  }

  return withReferralCookie(request, NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
