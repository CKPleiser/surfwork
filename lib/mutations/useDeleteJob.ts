/**
 * Job Deletion Mutation Hook
 * Handles job deletion (soft delete) with cache invalidation
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "@/app/jobs/[id]/edit/actions";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const result = await deleteJob(jobId);

      // Handle server action errors
      if (result && "error" in result) {
        throw new Error(result.error);
      }

      return result;
    },

    onSuccess: () => {
      // Invalidate all job-related queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });

      // Note: redirect happens in server action
    },

    onError: (error) => {
      console.error("[useDeleteJob] Mutation error:", error);
    },
  });
}
