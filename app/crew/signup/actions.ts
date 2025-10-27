/**
 * Crew Signup Server Actions
 * Handles crew member registration with profile, roles, and pitch creation
 */

"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/lib/utils/slug";
import type { CrewSignupFormData } from "@/lib/validations/crew-signup";

export async function crewSignup(data: CrewSignupFormData) {
  try {
    // Use regular client for auth operations
    const supabase = await createClient();
    // Use service role client for database operations (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient();

    // 1. Create auth account
    const password = data.password && data.password !== "" ? data.password : crypto.randomUUID();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("[crewSignup] Auth error:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create account" };
    }

    const userId = authData.user.id;

    // 2. Generate unique slug from first + last name
    const displayName = `${data.first_name} ${data.last_name}`;
    const slug = await generateUniqueSlug(displayName);

    // 3. Create/update profile (using service role to bypass RLS)
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
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[crewSignup] Profile error:", profileError);
      return { error: `Profile creation failed: ${profileError.message}` };
    }

    // 4. Insert roles (multiple rows, using service role)
    if (data.roles && data.roles.length > 0) {
      const roleRows = data.roles.map((role) => ({
        profile_id: userId,
        role: role,
      }));

      const { error: rolesError } = await supabaseAdmin
        .from("profile_roles")
        .insert(roleRows);

      if (rolesError) {
        console.error("[crewSignup] Roles error:", rolesError);
        // Non-fatal - continue with signup
      }
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
        },
      });

    if (pitchError) {
      console.error("[crewSignup] Pitch error:", pitchError);
      // Non-fatal - continue with signup
    }

    return {
      success: true,
      userId: userId,
      slug: slug,
    };
  } catch (error) {
    console.error("[crewSignup] Unexpected error:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  profileId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "File must be an image" };
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Image must be less than 2MB" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${profileId}/avatar.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadAvatar] Upload error:", uploadError);
      return { error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    console.error("[uploadAvatar] Unexpected error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}
