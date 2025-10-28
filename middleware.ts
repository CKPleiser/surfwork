/**
 * Middleware - Session Management & Route Protection
 *
 * Best practices for Next.js 14 + Supabase SSR:
 * 1. Always call updateSession() to refresh auth tokens
 * 2. Use getUser() for authoritative session validation (not cookie checks)
 * 3. Keep middleware lean - validate auth, don't fetch data
 * 4. Server Components handle fine-grained authorization
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Protected route patterns requiring authentication
const PROTECTED_ROUTES = [
  /^\/dashboard(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/jobs\/new(\/|$)/,
  /^\/jobs\/[^/]+\/edit(\/|$)/,
  /^\/organizations\/[^/]+\/edit(\/|$)/,
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Check if route requires protection
  const isProtectedRoute = PROTECTED_ROUTES.some((pattern) => pattern.test(pathname));

  // Create Supabase client with cookie handling
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: Always call getUser() to refresh session
  // This validates the JWT and updates cookies if needed
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to auth if accessing protected route without valid session
  if (isProtectedRoute && !user) {
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Return response with updated cookies
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  // Explicitly use Node.js runtime to avoid Edge Runtime warnings
  runtime: 'nodejs',
}
