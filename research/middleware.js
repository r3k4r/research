import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isAuth = !!req.nextauth.token
    
    // Get hasVisited cookie
    const hasVisited = req.cookies.get('hasVisited')
    
    // Public routes when logged out, private when logged in
    const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/two-factor']
    
    // Handle welcome page logic
    if (pathname === '/welcome') {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      if (hasVisited) {
        return NextResponse.redirect(new URL('/signin', req.url))
      }
      // First time visitor, set cookie and show welcome page
      const response = NextResponse.next()
      response.cookies.set('hasVisited', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
      return response
    }
    
    if (isAuth && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (!isAuth && !authRoutes.includes(pathname) && pathname !== '/welcome') {
      return NextResponse.redirect(new URL('/welcome', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true
    },
    secret: process.env.NEXTAUTH_SECRET, 
  }
)

// Protect all routes except static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}