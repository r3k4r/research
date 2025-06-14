import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isAuth = !!req.nextauth.token
    const userRole = req.nextauth.token?.role || null
    
    // Get hasVisited cookie
    const hasVisited = req.cookies.get('hasVisited')
    
    // Routes that are always public (accessible to everyone)
    const publicRoutes = ['/forgot-password', '/verify-email', '/reset-password', '/two-factor']
    
    // Public routes when logged out, private when logged in
    const authRoutes = ['/signin', '/signup']

    // Define route permissions
    const routePermissions = {
      '/': ['ADMIN', 'PROVIDER', 'USER'],
      '/providers': ['ADMIN', 'PROVIDER', 'USER'],
      '/aboutus': ['ADMIN', 'PROVIDER', 'USER'],
      '/how-it-works': ['ADMIN', 'PROVIDER', 'USER'],
      '/admin-dashboard': ['ADMIN'],
      '/provider-dashboard': ['PROVIDER', 'ADMIN']
    }

    // If the current path is a public route, allow access regardless of auth status
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    if (pathname === '/welcome') {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      if (hasVisited) {
        return NextResponse.redirect(new URL('/signin', req.url))
      }
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
    
    if (!isAuth && !authRoutes.includes(pathname) && pathname !== '/welcome' && !publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/welcome', req.url))
    }

    // Check route permissions for authenticated users
    if (isAuth && userRole) {
      // Admin can access all routes
      if (userRole === 'ADMIN') {
        return NextResponse.next()
      }

      // Check if the current path is restricted
      const allowedRoles = routePermissions[pathname]
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', req.url))
      }
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