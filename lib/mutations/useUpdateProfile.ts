/**
 * Profile Update Mutation Hook
 * Client-side mutation for updating user profile
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface ProfileUpdateData {
  display_name?: string;
  kind?: "person" | "org";
  country?: string;
  bio?: string;
  avatar_url?: string;
  skills?: string[];
  links?: {
    instagram?: string;
    portfolio?: string;
    site?: string;
    whatsapp?: string;
  };
  about?: string;
  is_public?: boolean;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    },

    onSuccess: () => {
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },

    onError: (error) => {
      console.error("[useUpdateProfile] Mutation error:", error);
    },
  });
}
