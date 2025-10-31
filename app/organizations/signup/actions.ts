/**
 * Organization Signup Server Actions
 * Handles organization registration with account creation
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
import { uploadOrgLogo as uploadOrgLogoHelper } from "@/lib/storage/upload-helpers";
import { errorTracker } from "@/lib/utils/error-tracking";
import type { OrganizationSignupFormData } from "@/lib/validations/organization-signup";
import type { SignupResult } from "@/app/crew/signup/actions";

export async function organizationSignup(data: OrganizationSignupFormData): Promise<SignupResult> {
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
      errorTracker.logError("Auth error during organization signup", { error: authError, email: data.email });
      return { error: handleAuthError(authError) };
    }

    if (!authData?.user) {
      return { error: "Failed to create account" };
    }

    const userId = authData.user.id;

    // 3. Generate unique slug from organization name
    const slug = await generateUniqueSlug(data.name, supabaseAdmin);

    // 4. Create organization (using service role to bypass RLS)
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        owner_profile_id: userId,
        name: data.name,
        org_type: data.org_type,
        country: data.country,
        city: data.city || null,
        about: data.about || null,
        website: data.website || null,
        instagram: data.instagram || null,
        whatsapp: data.whatsapp || null,
        slug: slug,
        verified: false,
        featured: false,
      })
      .select("id")
      .single();

    if (orgError) {
      errorTracker.logError("Organization creation error", { error: orgError, name: data.name });
      return { error: handleDatabaseError(orgError, "organization creation") };
    }

    if (!orgData) {
      return { error: "Failed to create organization" };
    }

    // 5. Update owner profile with contact name (using service role)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        kind: "org",
        display_name: data.contact_name,
        email: data.email,
      })
      .eq("id", userId);

    if (profileError) {
      errorTracker.logError("Profile creation error during org signup", { error: profileError, userId });
      return { error: handleDatabaseError(profileError, "profile creation") };
    }

    return {
      success: true as const,
      userId: userId,
      organizationId: orgData.id,
      slug: slug,
      usingMagicLink: usingMagicLink,
      email: data.email,
    };
  } catch (error) {
    errorTracker.logError("Unexpected error during organization signup", { error, email: data.email });
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Upload organization logo - wrapper for FormData compatibility
 * Extracts file and orgId from FormData, uploads to storage, and saves URL to database
 */
export async function uploadOrgLogo(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File;
  const orgId = formData.get("orgId") as string;

  if (!file || !orgId) {
    return { error: "Missing file or organization ID" };
  }

  // Upload to storage
  const uploadResult = await uploadOrgLogoHelper(file, orgId);

  if (uploadResult.error || !uploadResult.url) {
    return uploadResult;
  }

  // Save URL to database
  const supabaseAdmin = createServiceRoleClient();
  const { error: updateError } = await supabaseAdmin
    .from("organizations")
    .update({ logo_url: uploadResult.url })
    .eq("id", orgId);

  if (updateError) {
    errorTracker.logError("Failed to save logo URL to database", { error: updateError, orgId });
    return { error: "Logo uploaded but failed to save URL" };
  }

  return uploadResult;
}
