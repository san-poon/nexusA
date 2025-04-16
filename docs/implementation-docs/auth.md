# Implement Authentication using Supabase Auth for nexusA

**Goal:** Set up user authentication using Supabase Auth within the Next.js 15 App Router project (@about-nexusA.md).

**Tech Stack:**
*   Next.js 15 App Router
*   Supabase Auth
*   @supabase/ssr
*   Drizzle ORM (for potential user profile linkage later)
*   React 19
*   TailwindCSS
*   Shadcn UI

**Authentication Methods:**
Implement the following sign-in/sign-up methods:
1.  **Email & Password:** Standard username/password authentication.
2.  **Magic Link:** Email-based passwordless login.
3.  **OAuth:** Google & GitHub.

**Implementation Steps:**

1.  **Environment Setup:**
    *   **Action:** Create a `.env.local` file in the project root (if it doesn't exist).
    *   **Action:** Move `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL` from `.env` to `.env.local`.
    *   **Reason:** `.env.local` is the standard for secret keys and is typically ignored by Git. Use `.env` for non-secret defaults if needed.
    *   **Action:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` if direct admin operations are needed later (not strictly required for basic user auth actions).
    *   **Verification:** Ensure `.env.local` is listed in `.gitignore` file.

2.  **Middleware for Session Management:**
    *   **Action:** Create `middleware.ts` in the project root (alongside `app/`, `lib/`, etc. or in `src/` if using `src` directory).
    *   **Action:** Implement the Supabase SSR middleware logic. This involves creating a server client within the middleware to handle session refreshes.
    *   **Content Example (`middleware.ts`):**
        ```typescript
        import { createServerClient, type CookieOptions } from '@supabase/ssr'
        import { NextResponse, type NextRequest } from 'next/server'

        export async function middleware(request: NextRequest) {
          let response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name: string) {
                  return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                  request.cookies.set({ name, value, ...options })
                  response = NextResponse.next({ request }) // Update response if cookie is set
                  response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                  request.cookies.set({ name, value: '', ...options })
                  response = NextResponse.next({ request }) // Update response if cookie is removed
                  response.cookies.set({ name, value: '', ...options })
                },
              },
            }
          )

          // Refresh session if expired - important!
          await supabase.auth.getSession()

          // Optional: Route protection example
          // const { data: { session } } = await supabase.auth.getSession();
          // if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
          //   return NextResponse.redirect(new URL('/sign-in', request.url));
          // }

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
            '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
          ],
        }
        ```
    *   **Reference:** [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
    *   **Note:** The `matcher` config is crucial for performance, ensuring middleware only runs where needed. Adjust it based on your protected routes and static assets.

3.  **Auth UI Pages (`app/(auth)/`):**
    *   **Action:** Create the directory `app/(auth)`. The parentheses denote a Route Group, which organizes routes without affecting the URL path.
    *   **Action:** Create `app/(auth)/sign-in/page.tsx`:
        *   Use `Card`, `Form`, `Input`, `Label`, `Button` etc. from `shadcn/ui`.
        *   Implement forms for Email/Password, buttons for OAuth providers, and a link/button for Magic Link.
        *   Handle form submission state (loading, errors).
    *   **Action:** Create `app/(auth)/sign-up/page.tsx`:
        *   Similar structure to sign-in for the sign-up form.
    *   **Action:** Create `app/(auth)/request-magic-link/page.tsx` (or similar):
        *   Simple form with an email input.
    *   **Action:** Update `components/layout/UserMenu.tsx`:
        *   Wrap the "Sign In" `DropdownMenuItem` (and relevant `Button`) with `<Link href="/sign-in">`.

4.  **Server Actions (`app/_actions/auth.ts`):**
    *   **Action:** Create the file `app/_actions/auth.ts`. The underscore signifies these are private implementation details not directly accessible via URL.
    *   **Action:** Implement server action functions:
        *   `signUp(formData: FormData)`
        *   `signInWithPassword(formData: FormData)`
        *   `signInWithGoogle()` (calls `supabase.auth.signInWithOAuth`, redirecting to Supabase)
        *   `signInWithGitHub()` (calls `supabase.auth.signInWithOAuth`, redirecting to Supabase)
        *   `sendMagicLink(formData: FormData)` (calls `supabase.auth.signInWithOtp`)
        *   `signOut()` (calls `supabase.auth.signOut`)
    *   **Details:** Use the server Supabase client (`import { createClient } from '@/lib/supabase/server'`). Handle validation (e.g., Zod). Return JSON responses for form feedback. Use `redirect()` from `next/navigation` after successful actions.

5.  **OAuth Callback (`app/auth/callback/route.ts`):**
    *   **Action:** Create the file `app/auth/callback/route.ts`.
    *   **Action:** Implement the `GET` Route Handler.
    *   **Details:** Extract the `code` from search parameters. Exchange the code for a session using the server Supabase client (`supabase.auth.exchangeCodeForSession(code)`). Redirect the user upon success (e.g., to `/dashboard`). Handle errors appropriately.

6.  **Sign Out Integration:**
    *   **Action:** Update `components/layout/UserMenu.tsx`:
        *   Import the `signOut` server action.
        *   Wrap the "Sign Out" `DropdownMenuItem` (and relevant `Button`) in a `<form>` element:
          ```jsx
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-destructive">
              Sign Out
            </Button> // Or DropdownMenuItem equivalent
          </form>
          ```

7.  **Protected Route Example:**
    *   **Action:** Create a sample protected page (e.g., `app/dashboard/page.tsx`).
    *   **Action:** Use the middleware (Step 2) to protect this route, or add a check within the page/layout using the server client:
        ```typescript // Example in page.tsx
        import { createClient } from '@/lib/supabase/server'
        import { redirect } from 'next/navigation'

        export default async function DashboardPage() {
          const supabase = await createClient()
          const { data: { session } } = await supabase.auth.getSession()

          if (!session) {
            redirect('/sign-in')
          }

          // ... rest of the dashboard page
        }
        ```

8.  **Styling:**
    *   Apply consistent styling using TailwindCSS and `shadcn/ui` defaults.
    *   Apply the `wash` background color from `globals.css` to relevant layout containers or page backgrounds as needed.

**Important Considerations:**
*   Prioritize security and follow Supabase/Next.js best practices.
*   Handle errors gracefully in UI and server actions.
*   Ensure environment variables are correctly configured and secured.
*   Test all authentication flows thoroughly.