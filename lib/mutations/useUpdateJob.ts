/**
 * Job Update Mutation Hook
 * Handles job updates with cache invalidation
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJob } from "@/app/jobs/[id]/edit/actions";
import { queryKeys } from "@/lib/query-keys";
import type { JobFormData } from "@/lib/validations/job";

export function useUpdateJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: JobFormData) => {
      const result = await updateJob(jobId, formData);

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
      console.error("[useUpdateJob] Mutation error:", error);
    },
  });
}
