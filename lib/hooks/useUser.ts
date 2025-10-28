/**
 * useUser Hook
 * Manages current user authentication state and profile data
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";
import type { UserProfile } from "@/lib/types/user";

async function fetchUser(): Promise<UserProfile | null> {
  const supabase = createClient();

  // Get auth session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return null;
  }

  // Fetch profile data with retry logic
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile) {
    console.error("[useUser] Profile fetch error:", profileError);

    // If auth session exists but profile fetch failed, throw error to trigger React Query retry
    // This prevents AuthGuard from thinking user is not authenticated
    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    // If no profile exists at all, return null (truly not authenticated)
    return null;
  }

  return {
    id: profile.id,
    kind: profile.kind,
    display_name: profile.display_name,
    first_name: profile.first_name,
    last_name: profile.last_name,
    avatar_url: profile.avatar_url,
    email: profile.email || session.user.email || "",
    slug: profile.slug,
    country: profile.country,
    bio: profile.bio,
    about: profile.about,
    is_public: profile.is_public,
    is_admin: profile.is_admin,
    skills: profile.skills,
    links: profile.links,
  };
}

export function useUser() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: fetchUser,
    staleTime: 2 * 60 * 1000, // 2 minutes - user data should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true, // Always check for fresh user data on component mount
    retry: 2, // Retry twice on profile fetch errors to handle transient failures
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff: 1s, 2s max 3s
  });

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Refetch user data when signed in
        queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
      } else if (event === "SIGNED_OUT") {
        // Clear user data when signed out
        queryClient.setQueryData(queryKeys.user.current(), null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
  };
}

/**
 * Hook to require authentication (for use in components)
 */
export function useRequireAuth() {
  const { user, isLoading } = useUser();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
