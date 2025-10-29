// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

// If you localize routes, add locale prefixes like: `/:path*` via config.matcher
const PROTECTED = [/^\/dashboard(?:\/|$)/, /^\/settings(?:\/|$)/, /^\/jobs\/new(?:\/|$)/, /^\/jobs\/[^/]+\/edit(?:\/|$)/, /^\/organizations\/[^/]+\/edit(?:\/|$)/];

function isProtectedPath(pathname: string) {
  return PROTECTED.some((re) => re.test(pathname));
}

// Minimal, presence-only cookie check. Real validation happens on the server.
function hasSupabaseAuthCookie(req: NextRequest) {
  // Supabase SSR uses cookies with format: sb-<project-ref>-auth-token
  // In local dev: sb-localhost-auth-token
  return req.cookies.getAll().some(c =>
    c.name.startsWith("sb-") && c.name.includes("auth-token")
  );
}

export function middleware(req: NextRequest) {
  // Only guard navigations that render pages
  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasSupabaseAuthCookie(req)) {
    const url = nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname); // keep param name consistent across app
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run only where needed. Add locales or basePath if applicable.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/jobs/new",
    "/jobs/:id/edit",
    "/organizations/:id/edit",
  ],
};
