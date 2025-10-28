/**
 * Server-Side Session Utilities
 * React cache() based authentication for Server Components
 *
 * This module provides per-request cached session access for Server Components.
 * Use these functions in Server Components and Server Actions to read auth state
 * from HTTP-only cookies without React Query or client-side state management.
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import type { UserWithProfile } from "@/lib/types/user";

// Re-export for convenience
export type { UserWithProfile } from "@/lib/types/user";

/**
 * Create a Supabase client for Server Components
 * This is a cached per-request instance
 */
const getSupabaseServer = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
});

/**
 * Get current session from HTTP-only cookies
 * Cached per-request via React cache()
 *
 * Use in Server Components for zero-delay auth state access
 * Uses getUser() for secure authentication against Supabase Auth server
 */
export const getSession = cache(async () => {
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Auth session missing is expected for public pages
  if (error?.message?.includes('Auth session missing')) {
    return null;
  }

  if (error) {
    console.error("[getSession] Error fetching user:", error);
    return null;
  }

  if (!user) {
    return null;
  }

  // Return session-like object with user data
  return {
    user,
    access_token: null, // Not needed for server-side operations
    refresh_token: null,
  };
});

/**
 * Get current user with profile information
 * Cached per-request via React cache()
 *
 * Returns user object with profile data joined from profiles table
 * Returns null if not authenticated
 */
export const getUser = cache(async (): Promise<UserWithProfile | null> => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const supabase = await getSupabaseServer();

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, kind, display_name, first_name, last_name, avatar_url, email, slug, country, bio, about, is_public, skills, links")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error("[getUser] Error fetching profile:", profileError);
    // Return user without profile data if profile fetch fails
    return session.user as UserWithProfile;
  }

  // Combine user and profile
  return {
    ...session.user,
    profile: profile || undefined,
  };
});

/**
 * Require authenticated user or throw
 * Use in Server Components/Actions that require authentication
 *
 * @throws {Error} If user is not authenticated
 * @returns {Promise<UserWithProfile>} Authenticated user with profile
 *
 * @example
 * ```typescript
 * export default async function ProtectedPage() {
 *   const user = await requireAuth();
 *   return <div>Hello {user.profile?.display_name}</div>;
 * }
 * ```
 */
export async function requireAuth(): Promise<UserWithProfile> {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return user;
}

/**
 * Require organization account or throw
 * Use in Server Components/Actions that require organization membership
 *
 * @throws {Error} If user is not authenticated or not an organization account
 * @returns {Promise<UserWithProfile>} Authenticated organization user
 *
 * @example
 * ```typescript
 * export default async function OrganizationDashboard() {
 *   const user = await requireOrgAccount();
 *   return <div>Organization: {user.profile?.display_name}</div>;
 * }
 * ```
 */
export async function requireOrgAccount(): Promise<UserWithProfile> {
  const user = await requireAuth();

  if (user.profile?.kind !== "org") {
    throw new Error("Forbidden: Organization account required");
  }

  return user;
}

/**
 * Require crew account or throw
 * Use in Server Components/Actions that require crew membership
 *
 * @throws {Error} If user is not authenticated or not a crew account
 * @returns {Promise<UserWithProfile>} Authenticated crew user
 *
 * @example
 * ```typescript
 * export default async function CrewProfile() {
 *   const user = await requireCrewAccount();
 *   return <div>Crew: {user.profile?.display_name}</div>;
 * }
 * ```
 */
export async function requireCrewAccount(): Promise<UserWithProfile> {
  const user = await requireAuth();

  if (user.profile?.kind !== "person") {
    throw new Error("Forbidden: Crew account required");
  }

  return user;
}

/**
 * Check if user is authenticated
 * Convenience function for conditional rendering
 *
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 *
 * @example
 * ```typescript
 * export default async function Page() {
 *   const isAuthenticated = await isAuth();
 *   return isAuthenticated ? <Dashboard /> : <Landing />;
 * }
 * ```
 */
export async function isAuth(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}
