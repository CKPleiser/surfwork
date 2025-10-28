import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Handler
 * Handles OAuth and magic link callbacks from Supabase Auth
 *
 * This route is called when:
 * - User clicks a magic link in their email
 * - User completes OAuth flow (if implemented)
 * - User clicks password reset link
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const error_code = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  console.log("[auth/callback] Processing callback", {
    hasCode: !!code,
    hasError: !!error_code,
    next,
  });

  // Handle errors from auth provider
  if (error_code) {
    console.error("[auth/callback] Auth provider error:", error_code, error_description);

    // Provide user-friendly error messages
    const errorMessage = getErrorMessage(error_code, error_description);
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }

  // Handle missing code
  if (!code) {
    console.error("[auth/callback] No code provided");
    return NextResponse.redirect(
      new URL("/auth?error=Invalid authentication link. Please try again.", request.url)
    );
  }

  try {
    const supabase = await createClient();

    // Exchange code for session with retry logic
    console.log("[auth/callback] Exchanging code for session");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Session exchange error:", error);

      // Handle specific error cases
      if (error.message?.includes("expired")) {
        return NextResponse.redirect(
          new URL("/auth?error=This link has expired. Please request a new one.", request.url)
        );
      }

      if (error.message?.includes("already been used")) {
        return NextResponse.redirect(
          new URL("/auth?error=This link has already been used. Please request a new one.", request.url)
        );
      }

      // Generic error
      return NextResponse.redirect(
        new URL(`/auth?error=Authentication failed. Please try again.`, request.url)
      );
    }

    // Verify session was created
    if (!data?.session) {
      console.error("[auth/callback] No session created despite no error");
      return NextResponse.redirect(
        new URL("/auth?error=Failed to create session. Please try again.", request.url)
      );
    }

    console.log("[auth/callback] Session created successfully, redirecting to:", next);

    // Success! Redirect to requested page
    return NextResponse.redirect(new URL(next, request.url));

  } catch (error) {
    // Handle unexpected errors
    console.error("[auth/callback] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/auth?error=An unexpected error occurred. Please try again.", request.url)
    );
  }
}

/**
 * Get user-friendly error message from auth error code
 */
function getErrorMessage(code: string, description: string | null): string {
  const messages: Record<string, string> = {
    "access_denied": "Access denied. Please try signing in again.",
    "server_error": "Server error occurred. Please try again later.",
    "temporarily_unavailable": "Service temporarily unavailable. Please try again later.",
    "invalid_request": "Invalid authentication request. Please try again.",
    "unauthorized_client": "Unauthorized access. Please try again.",
  };

  return messages[code] || description || "Authentication failed. Please try again.";
}
