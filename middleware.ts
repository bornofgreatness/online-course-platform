import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPrefixes = ['/dashboard', '/admin', '/affiliate']
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.email) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin')) {
    const role = ((token as { role?: string }).role ?? '').toString().toUpperCase()
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/affiliate/:path*'],
}
