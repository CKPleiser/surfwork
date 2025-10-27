/**
 * Organization Query Hooks
 * React Query hooks for fetching organization data
 */

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/lib/supabase/types";

export function useOrganization(organizationId: string | undefined | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (error) {
        throw error;
      }

      return data as Organization;
    },
    enabled: !!organizationId,
  });
}

/**
 * Fetch organization by slug instead of ID (for public profile pages)
 */
export function useOrganizationBySlug(slug: string | undefined | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["organization", "slug", slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error("Organization slug is required");
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        throw error;
      }

      return data as Organization;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch user's organization (for org users)
 * Returns the organization owned by the current user
 */
export function useUserOrganization(userId: string | undefined | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["organization", "user", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_profile_id", userId)
        .single();

      if (error) {
        // Not found is acceptable - user might not have an organization yet
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as Organization;
    },
    enabled: !!userId,
  });
}
