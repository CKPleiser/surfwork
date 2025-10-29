/**
 * Server Actions for Profile Editing
 * Handle profile updates with authentication
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";

/**
 * Update user profile
 */
export async function updateProfile(formData: ProfileFormData) {
  const supabase = await createClient();

  // Validate form data
  const validatedData = profileSchema.parse(formData);

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to update your profile",
    };
  }

  // Update the profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      display_name: validatedData.display_name,
      kind: validatedData.kind,
      country: validatedData.country || null,
      bio: validatedData.bio || null,
      avatar_url: validatedData.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return {
      error: "Failed to update profile. Please try again.",
    };
  }

  // Revalidate dashboard and settings pages
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return { success: true };
}
