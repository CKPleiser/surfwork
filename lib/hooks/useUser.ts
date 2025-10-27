/**
 * useUser Hook
 * Manages current user authentication state and profile data
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  kind: "person" | "org";
  country: string | null;
  bio: string | null;
  slug: string;
  onboarding_completed: boolean;
  is_admin: boolean;
}

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

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile) {
    console.error("[useUser] Profile fetch error:", profileError);
    return null;
  }

  return {
    id: profile.id,
    email: profile.email || session.user.email || "",
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    kind: profile.kind,
    country: profile.country,
    bio: profile.bio,
    slug: profile.slug,
    onboarding_completed: profile.onboarding_completed,
    is_admin: profile.is_admin,
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
