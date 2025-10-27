/**
 * Crew Signup Mutation Hook
 * Client-side mutation for crew member registration
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { crewSignup } from "@/app/crew/signup/actions";
import type { CrewSignupFormData } from "@/lib/validations/crew-signup";

export function useCrewSignup() {
  return useMutation({
    mutationFn: async (formData: CrewSignupFormData) => {
      const result = await crewSignup(formData);

      // Handle server action errors
      if (result && "error" in result) {
        throw new Error(result.error);
      }

      return result;
    },

    onError: (error) => {
      console.error("[useCrewSignup] Mutation error:", error);
    },
  });
}
