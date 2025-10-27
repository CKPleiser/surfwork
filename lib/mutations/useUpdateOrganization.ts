/**
 * Update Organization Mutation Hook
 * React Query mutation for updating organization profiles
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { OrganizationProfileFormData } from "@/lib/validations/organization";
import { organizationProfileSchema } from "@/lib/validations/organization";
import type { Organization } from "@/lib/supabase/types";

interface UpdateOrganizationParams {
  organizationId: string;
  data: Partial<OrganizationProfileFormData>;
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ organizationId, data }: UpdateOrganizationParams) => {
      // Validate data (partial schema for updates)
      const validatedData = organizationProfileSchema.partial().parse(data);

      // Update organization in database
      const { data: organization, error } = await supabase
        .from("organizations")
        .update(validatedData)
        .eq("id", organizationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return organization as Organization;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["organization", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["organization", "slug", data.slug] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "user"] });
    },
    onError: (error) => {
      console.error("Failed to update organization:", error);
    },
  });
}
