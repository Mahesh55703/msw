import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/admin']
const publicRoutes = ['/admin/login']

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route)) && !publicRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }

  if (isPublicRoute && session?.userId && path === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
