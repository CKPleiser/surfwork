/**
 * React hooks for managing job applications
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, ApplicationStatus, ApplicationWithDetails } from "@/lib/supabase/types";

/**
 * Hook to apply for a job
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, message }: { jobId: string; message: string }) => {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit application");
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["job-application", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["user-applications"] });
    },
  });
}

/**
 * Hook to check if user has applied to a job
 */
export function useJobApplicationStatus(jobId: string) {
  return useQuery({
    queryKey: ["job-application", jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}/applications`);
      
      if (!response.ok) {
        throw new Error("Failed to check application status");
      }

      return response.json() as Promise<{
        hasApplied: boolean;
        application: Application | null;
      }>;
    },
    enabled: !!jobId,
  });
}

/**
 * Hook to get user's applications
 */
export function useUserApplications() {
  return useQuery({
    queryKey: ["user-applications"],
    queryFn: async () => {
      const response = await fetch("/api/crew/applications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const result = await response.json();
      return result.data as ApplicationWithDetails[];
    },
  });
}

/**
 * Hook to get organization's applications
 */
export function useOrganizationApplications() {
  return useQuery({
    queryKey: ["organization-applications"],
    queryFn: async () => {
      const response = await fetch("/api/organization/applications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const result = await response.json();
      return result.data as ApplicationWithDetails[];
    },
  });
}

/**
 * Hook to update application status
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status 
    }: { 
      applicationId: string; 
      status: ApplicationStatus;
    }) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update application");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate organization applications query
      queryClient.invalidateQueries({ queryKey: ["organization-applications"] });
    },
  });
}

/**
 * Hook to manage application filters
 */
export function useApplicationFilters(applications: ApplicationWithDetails[]) {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.crew.display_name.toLowerCase().includes(searchLower) ||
        app.crew.email?.toLowerCase().includes(searchLower) ||
        app.message.toLowerCase().includes(searchLower) ||
        app.job.title.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  return {
    filteredApplications,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    statusCounts,
  };
}