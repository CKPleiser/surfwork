/**
 * Crew Profile Edit Server Actions
 * Handles crew profile updates
 */

"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { errorTracker } from "@/lib/utils/error-tracking";
import { uploadAvatar } from "@/lib/storage/upload-helpers";
import type { CrewProfileEditFormData } from "./schema";

export interface UpdateProfileResult {
  success?: boolean;
  error?: string;
}

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Uploads avatar for crew profile
 * @param formData FormData containing the avatar file
 * @param profileId User profile ID
 * @returns Upload result with URL or error
 */
export async function uploadAvatarForProfile(
  formData: FormData,
  profileId: string
): Promise<UploadResult> {
  try {
    const file = formData.get("avatar") as File;

    if (!file) {
      return { error: "No file provided" };
    }

    return await uploadAvatar(file, profileId);
  } catch (error) {
    errorTracker.logError("Avatar upload error", { error, profileId });
    return {
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}

export async function updateCrewProfile(
  profileId: string,
  data: CrewProfileEditFormData
): Promise<UpdateProfileResult> {
  try {
    // Use service role client for database operations (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient();

    // Prepare links object - filter out empty values
    const links = {
      instagram: data.links.instagram || null,
      portfolio: data.links.portfolio || null,
      site: data.links.site || null,
      whatsapp: data.links.whatsapp || null,
    };

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: `${data.first_name} ${data.last_name}`,
        country: data.country || null,
        bio: data.bio || null,
        avatar_url: data.avatar_url || null,
        is_public: data.is_public ?? true,
        skills: data.skills || [],
        links: links,
        about: data.about || null,
        // Store additional fields in the about or a custom JSON field
        // Note: These fields don't exist in the current schema yet
        // We'll need to either add them or store them differently
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (profileError) {
      errorTracker.logError("Profile update error", { error: profileError, profileId });
      return { error: "Failed to update profile. Please try again." };
    }

    return { success: true };
  } catch (error) {
    errorTracker.logError("Unexpected error during profile update", { error, profileId });
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
