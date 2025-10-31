/**
 * Crew Signup Server Actions
 * Handles crew member registration with profile, roles, and pitch creation
 */

"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/lib/utils/slug";
import {
  validatePassword,
  createAuthAccount,
  handleAuthError,
  handleDatabaseError,
} from "@/lib/auth/signup-helpers";
import { errorTracker } from "@/lib/utils/error-tracking";
import { uploadAvatar } from "@/lib/storage/upload-helpers";
import type { CrewSignupFormData } from "./schema";

export { uploadAvatar };

type SignupSuccess = {
  success: true;
  userId: string;
  slug: string;
  usingMagicLink: boolean;
  email: string;
  organizationId?: string; // Present for organization signup
};

type SignupError = {
  success?: false;
  error: string;
};

export type SignupResult = SignupSuccess | SignupError;

export async function crewSignup(data: CrewSignupFormData): Promise<SignupResult> {
  try {
    // Use service role client for database operations (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient();

    // Track if using magic link (no password provided)
    const usingMagicLink = !data.password || data.password === "";

    // 1. Validate password before attempting auth signup
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      return { error: passwordError };
    }

    // 2. Create auth account
    const { data: authData, error: authError } = await createAuthAccount({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      errorTracker.logError("Auth error during crew signup", { error: authError, email: data.email });
      return { error: handleAuthError(authError) };
    }

    if (!authData?.user) {
      return { error: "Failed to create account" };
    }

    const userId = authData.user.id;

    // 3. Generate unique slug from first + last name
    const displayName = `${data.first_name} ${data.last_name}`;
    const slug = await generateUniqueSlug(displayName, supabaseAdmin);

    // 4. Create/update profile (using service role to bypass RLS)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        kind: "person",
        display_name: displayName,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        country: data.country || null,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null,
        slug: slug,
        is_public: data.is_public,
        skills: data.skills || [],
        links: data.links || null,
        about: data.about || null,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[crewSignup] Profile error:", profileError);
      return { error: handleDatabaseError(profileError, "profile creation") };
    }

    // 5. Create candidate pitch (using service role to bypass RLS)
    const { error: pitchError } = await supabaseAdmin
      .from("candidate_pitches")
      .insert({
        profile_id: userId,
        title: data.pitch_title,
        description: data.pitch_description,
        availability_start: data.availability_start && data.availability_start !== "" ? data.availability_start : null,
        availability_end: data.availability_end && data.availability_end !== "" ? data.availability_end : null,
        preferred_regions: data.preferred_regions || [],
        exchange_ok: data.open_to?.includes("exchange") || false,
        contact: data.contact_method,
        contact_value: data.contact_value,
        attributes: {
          open_to: data.open_to || [],
          roles: data.roles || [],
        },
      });

    if (pitchError) {
      console.error("[crewSignup] Pitch error:", pitchError);
      return { error: handleDatabaseError(pitchError, "pitch creation") };
    }

    return {
      success: true as const,
      userId: userId,
      slug: slug,
      usingMagicLink: usingMagicLink,
      email: data.email,
    };
  } catch (error) {
    errorTracker.logError("Unexpected error during crew signup", { error, email: data.email });
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
