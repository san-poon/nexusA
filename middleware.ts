import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

import {
  publicRoutes,
  authRoutes,
  DEFAULT_SIGNIN_REDIRECT,
  publicCreationRoutes,
  apiAuthPrefix
} from '@/lib/routes';


/*
* Middleware must be lightweight for it runs on every request.
* It is the first line of defense for authorization while
* Data Access Layer (DAL) being the ultimate auth guard with
* full correctness.
* 
* Good for centralizing redirect logic, allowing you
* to specify public vs. protected routes.
* Use for stateless checks (optimistic), 
* but not database checks (secure).
    * While it's ok to read cookies, since Middleware runs on every request (including prefetching), 
    * it should not be used for database checks to avoid making multiple calls on each navigation.
    * While Middleware can be useful for initial validation, it should not be the sole line of defense in protecting your data. 
    * The bulk of security checks should be performed in the Data Access Layer (DAL).
*/
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  await supabase.auth.getUser() // Using getUser() is slightly more efficient if you don't need the full session object

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}