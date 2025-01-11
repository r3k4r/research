import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isAuth = !!req.nextauth.token
    const session = req.nextauth.token;
    


    // console.log({
    //   isAuth,
    //   session,
    // });
    
    // Public routes when logged out, private when logged in
    const authRoutes = ['/welcome', '/signin', '/signup']
    
    if (isAuth && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    if (!isAuth && !authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/welcome', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // We'll handle authorization in the middleware function
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