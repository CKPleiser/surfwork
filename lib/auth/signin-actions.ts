/**
 * Signin Server Actions
 * Authentication actions for password, magic link, and OAuth signin
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { errorTracker } from "@/lib/utils/error-tracking";

export interface SignInResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Sign in with email and password
 * Note: Session duration is managed by Supabase Auth settings
 * The rememberMe parameter is preserved for future use when custom session management is needed
 */
export async function signInWithPassword(
  email: string,
  password: string,
  _rememberMe: boolean = false
): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    // Attempt to sign in
    // Session duration is controlled by Supabase project settings (default: 1 hour)
    // For longer sessions, update Supabase Dashboard -> Authentication -> Settings -> Session timeout
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorTracker.logError("Password signin failed", { error: error.message, email });

      // Provide helpful error messages
      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Invalid email or password. Please try again or use 'Forgot password?'",
        };
      }

      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: "Please verify your email before signing in. Check your inbox for the verification link.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Sign in failed. Please try again.",
      };
    }

    // Fetch user profile to determine account type
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("kind")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      errorTracker.logError("Failed to fetch profile after signin", {
        error: profileError,
        userId: data.user.id
      });
      // Still allow signin, just redirect to generic dashboard
      return {
        success: true,
        redirectTo: "/dashboard",
      };
    }

    // Redirect based on account type
    const redirectPath = profile?.kind === "org" ? "/dashboard" : "/dashboard";

    return {
      success: true,
      redirectTo: redirectPath,
    };
  } catch (error) {
    errorTracker.logError("Unexpected signin error", { error, email });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    // Send magic link email
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      errorTracker.logError("Magic link signin failed", { error: error.message, email });

      if (error.message.includes("User not found")) {
        return {
          success: false,
          error: "No account found with this email. Would you like to sign up?",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      redirectTo: `/auth/check-email?email=${encodeURIComponent(email)}`,
    };
  } catch (error) {
    errorTracker.logError("Unexpected magic link error", { error, email });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      errorTracker.logError("Password reset request failed", { error: error.message, email });
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      redirectTo: `/auth/check-email?email=${encodeURIComponent(email)}&type=reset`,
    };
  } catch (error) {
    errorTracker.logError("Unexpected password reset error", { error, email });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update password (for password reset flow)
 */
export async function updatePassword(newPassword: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      errorTracker.logError("Password update failed", { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      redirectTo: "/dashboard",
    };
  } catch (error) {
    errorTracker.logError("Unexpected password update error", { error });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      errorTracker.logError("Verification email resend failed", { error: error.message, email });
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    errorTracker.logError("Unexpected verification resend error", { error, email });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  } catch (error) {
    errorTracker.logError("Sign out failed", { error });
    redirect("/");
  }
}
