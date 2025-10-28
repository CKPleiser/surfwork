/**
 * Email Lookup Utility
 * Check if an email exists in the system and get user details
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { errorTracker } from "@/lib/utils/error-tracking";

export interface EmailLookupResult {
  exists: boolean;
  accountType?: "person" | "org";
  emailConfirmed?: boolean;
  error?: string;
}

/**
 * Check if email exists in profiles table
 * Returns account type if found
 */
export async function lookupEmail(email: string): Promise<EmailLookupResult> {
  try {
    const supabase = await createClient();

    // Query profiles table for this email
    const { data, error } = await supabase
      .from("profiles")
      .select("kind, id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      errorTracker.logError("Email lookup query failed", { error: error.message, email });
      return {
        exists: false,
        error: "Failed to check email. Please try again.",
      };
    }

    // No profile found
    if (!data) {
      return {
        exists: false,
      };
    }

    // Profile found - get email confirmation status from auth
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(data.id);

    if (authError) {
      // Log but don't fail - we still know the account exists
      errorTracker.logError("Failed to fetch auth status during lookup", {
        error: authError.message,
        userId: data.id
      });
    }

    return {
      exists: true,
      accountType: data.kind,
      emailConfirmed: authData?.user?.email_confirmed_at != null,
    };
  } catch (error) {
    errorTracker.logError("Unexpected email lookup error", { error, email });
    return {
      exists: false,
      error: "An unexpected error occurred.",
    };
  }
}
