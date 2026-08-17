import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const role = request.cookies.get('userRole')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/restaurant') && role !== 'RESTAURANT_OWNER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && token) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (role === 'RESTAURANT_OWNER') {
      return NextResponse.redirect(new URL('/restaurant/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/restaurant/:path*', '/admin/:path*', '/login'],
}
