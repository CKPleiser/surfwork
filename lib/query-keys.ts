/**
 * Query Key Factory
 * Centralized query key management for React Query
 * Provides type-safe, hierarchical query keys for cache invalidation
 */

export const queryKeys = {
  /**
   * Jobs query keys
   * Hierarchy: jobs > lists/details > specific instances
   */
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    list: (filters?: JobFilters) =>
      [...queryKeys.jobs.lists(), filters ?? {}] as const,
    latest: (limit = 3) =>
      [...queryKeys.jobs.lists(), { latest: true, limit }] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },

  /**
   * Coaches query keys
   * Hierarchy: coaches > lists/details > specific instances
   */
  coaches: {
    all: ["coaches"] as const,
    lists: () => [...queryKeys.coaches.all, "list"] as const,
    list: (filters?: CoachFilters) =>
      [...queryKeys.coaches.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.coaches.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.coaches.details(), id] as const,
  },

  /**
   * Organizations query keys
   * Hierarchy: organizations > lists/details > specific instances
   */
  organizations: {
    all: ["organizations"] as const,
    lists: () => [...queryKeys.organizations.all, "list"] as const,
    list: (filters?: OrganizationFilters) =>
      [...queryKeys.organizations.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.organizations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
  },

  /**
   * Profiles query keys
   * Hierarchy: profiles > lists/details > specific instances
   */
  profiles: {
    all: ["profiles"] as const,
    lists: () => [...queryKeys.profiles.all, "list"] as const,
    list: (filters?: ProfileFilters) =>
      [...queryKeys.profiles.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.profiles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.profiles.details(), id] as const,
    bySlug: (slug: string) =>
      [...queryKeys.profiles.details(), { slug }] as const,
  },

  /**
   * User query keys (authenticated user)
   * Hierarchy: user > current/organizations/jobs
   */
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
    organizations: () => [...queryKeys.user.all, "organizations"] as const,
    jobs: () => [...queryKeys.user.all, "jobs"] as const,
    savedJobs: () => [...queryKeys.user.all, "saved-jobs"] as const,
  },
} as const;

// Type definitions for filters
export interface JobFilters {
  role?: string;
  country?: string;
  search?: string;
  latest?: boolean;
  limit?: number;
}

export interface CoachFilters {
  country?: string;
  sports?: string[];
  search?: string;
}

export interface OrganizationFilters {
  country?: string;
  search?: string;
}

export interface ProfileFilters {
  kind?: "person" | "org";
  search?: string;
}

/**
 * Helper function to invalidate related queries
 *
 * @example
 * // Invalidate all jobs queries
 * await invalidateQueries(queryClient, queryKeys.jobs.all);
 *
 * // Invalidate specific job
 * await invalidateQueries(queryClient, queryKeys.jobs.detail(id));
 */
export const invalidateQueries = async (
  queryClient: any,
  queryKey: readonly unknown[]
) => {
  await queryClient.invalidateQueries({ queryKey });
};
