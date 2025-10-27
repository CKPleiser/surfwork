/**
 * User Jobs Query Hook
 * Fetches jobs posted by the current user
 */

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export interface UserJob {
  id: string;
  title: string;
  status: "active" | "pending" | "closed";
  role: string;
  city?: string;
  country: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

async function fetchUserJobs(): Promise<UserJob[]> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[useUserJobs] Auth error:", authError);
    return [];
  }

  // Get user's organization(s)
  const { data: organizations, error: organizationError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_profile_id", user.id);

  if (organizationError) {
    console.error("[useUserJobs] Organization fetch error:", organizationError);
    return [];
  }

  if (!organizations || organizations.length === 0) {
    // User has no organizations, so no jobs
    return [];
  }

  const organizationIds = organizations.map((o) => o.id);

  // Fetch jobs for user's organizations
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, status, role, city, country, created_at, updated_at, organization_id")
    .in("organization_id", organizationIds)
    .order("created_at", { ascending: false });

  if (jobsError) {
    console.error("[useUserJobs] Jobs fetch error:", jobsError);
    throw new Error(`Failed to fetch user jobs: ${jobsError.message}`);
  }

  return jobs || [];
}

export function useUserJobs() {
  return useQuery({
    queryKey: queryKeys.user.jobs(),
    queryFn: fetchUserJobs,
    staleTime: 1000 * 60, // 1 minute
  });
}
