/**
 * Job Creation Mutation Hook
 * Handles job creation with cache invalidation and optimistic updates
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/app/jobs/new/actions";
import { queryKeys } from "@/lib/query-keys";
import type { JobFormData } from "@/lib/validations/job";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: JobFormData) => {
      const result = await createJob(formData);

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
      // We don't need to manually navigate here
    },

    onError: (error) => {
      console.error("[useCreateJob] Mutation error:", error);
      // Error will be caught by error boundary or can be handled in form
    },
  });
}
