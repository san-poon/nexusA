import { type NextRequest } from 'next/server';
import { auth } from '@/auth';

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
    * While it’s ok to read cookies, since Middleware runs on every request (including prefetching), 
    * it should not be used for database checks to avoid making multiple calls on each navigation.
    * While Middleware can be useful for initial validation, it should not be the sole line of defense in protecting your data. 
    * The bulk of security checks should be performed in the Data Access Layer (DAL).
*/
export default async function middleware(request: NextRequest) {
  // const { nextUrl } = request;
  // const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  // const isPublicCreationRoute = publicCreationRoutes.includes(nextUrl.pathname);
  // if (isPublicRoute || isPublicCreationRoute) {
  //   return;
  // }

  // const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  // const session = await auth();
  // const isLoggedIn = session?.user;

  // const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  // if (isApiAuthRoute) {
  //   return;
  // }
  // if (isAuthRoute) {
  //   if (isLoggedIn) {
  //     return Response.redirect(new URL(DEFAULT_SIGNIN_REDIRECT, nextUrl))
  //   }
  //   return;
  // }

  // if (!isLoggedIn) {
  //   return Response.redirect(new URL("/auth/signin", nextUrl));
  // }
  return;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};