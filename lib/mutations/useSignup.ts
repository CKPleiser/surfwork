/**
 * Consolidated Signup Mutation Hook
 * Generic client-side mutation for crew and organization registration
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { crewSignup, type SignupResult } from "@/app/crew/signup/actions";
import { organizationSignup } from "@/app/organizations/signup/actions";
import type { CrewSignupFormData } from "@/app/crew/signup/schema";
import type { OrganizationSignupFormData } from "@/lib/validations/organization-signup";
import { errorTracker } from "@/lib/utils/error-tracking";

type SignupAction<T> = (
  formData: T
) => Promise<SignupResult>;

/**
 * Generic signup mutation hook
 * Handles server action errors and provides mutation state
 */
function createSignupHook<T>(signupAction: SignupAction<T>, hookName: string) {
  return function useSignupMutation() {
    return useMutation({
      mutationFn: async (formData: T) => {
        const result = await signupAction(formData);

        // Handle server action errors
        if (result && "error" in result) {
          throw new Error(result.error);
        }

        return result;
      },

      onError: (error) => {
        errorTracker.logError(`${hookName} mutation failed`, { error: error.message, hookName });
      },
    });
  };
}

/**
 * Crew signup mutation hook
 * For crew member registration
 */
export const useCrewSignup = createSignupHook<CrewSignupFormData>(
  crewSignup,
  "useCrewSignup"
);

/**
 * Organization signup mutation hook
 * For organization registration
 */
export const useOrganizationSignup =
  createSignupHook<OrganizationSignupFormData>(
    organizationSignup,
    "useOrganizationSignup"
  );
