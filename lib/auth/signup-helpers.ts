/**
 * Signup Auth Helpers
 * Shared authentication utilities for crew and organization signup
 */

import { createClient } from "@/lib/supabase/server";
import { errorTracker } from "@/lib/utils/error-tracking";

export interface AuthAccountData {
  email: string;
  password?: string;
}

export interface AuthResult {
  data: {
    user: {
      id: string;
      email?: string;
    } | null;
    session: any;
  } | null;
  error: any;
}

/**
 * Validates password meets minimum requirements
 * Call this BEFORE attempting auth signup to avoid information leaks
 *
 * @param password Optional password (empty string or undefined = magic link)
 * @returns Error message if invalid, null if valid or using magic link
 */
export function validatePassword(password?: string): string | null {
  // Empty password means magic link - that's valid
  if (!password || password === "") {
    return null;
  }

  // Check minimum length
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  // Add additional password requirements here if needed
  // e.g., require numbers, special chars, etc.

  return null;
}

/**
 * Creates a Supabase auth account with email and password
 * Falls back to magic link (random UUID password) if no password provided
 *
 * @param data Email and optional password
 * @returns Auth result with user data or error
 */
export async function createAuthAccount(
  data: AuthAccountData
): Promise<AuthResult> {
  const supabase = await createClient();

  // Determine password: use provided or generate random UUID for magic link
  const password =
    data.password && data.password !== "" ? data.password : crypto.randomUUID();

  // Check if using magic link (for logging purposes only)
  const usingMagicLink = !data.password || data.password === "";
  if (usingMagicLink) {
    errorTracker.logInfo("Using magic link authentication", { email: data.email });
  }

  // Create auth account
  const result = await supabase.auth.signUp({
    email: data.email,
    password: password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return result;
}

/**
 * Categorizes auth errors into user-friendly messages
 *
 * @param error Error from Supabase auth
 * @returns User-friendly error message
 */
export function handleAuthError(error: any): string {
  if (!error) {
    return "An unexpected error occurred";
  }

  const message = error.message?.toLowerCase() || "";

  // Duplicate email
  if (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("duplicate")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  // Invalid email format
  if (message.includes("invalid email") || message.includes("email")) {
    return "Please enter a valid email address.";
  }

  // Password issues
  if (message.includes("password")) {
    return "Password does not meet requirements. Please try a different password.";
  }

  // Rate limiting
  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  // Network issues
  if (message.includes("network") || message.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  // Generic fallback
  errorTracker.logError("Unhandled auth error", { error, message });
  return "Authentication failed. Please try again or contact support.";
}

/**
 * Categorizes database errors into user-friendly messages
 *
 * @param error Error from Supabase database operation
 * @param operation Description of the operation (e.g., "profile creation")
 * @returns User-friendly error message
 */
export function handleDatabaseError(error: any, operation: string): string {
  if (!error) {
    return `${operation} failed`;
  }

  const code = error.code || "";
  const message = error.message?.toLowerCase() || "";

  // Unique constraint violation (duplicate)
  if (code === "23505" || message.includes("unique")) {
    return `This ${operation} already exists. Please use a different value.`;
  }

  // Foreign key violation
  if (code === "23503" || message.includes("foreign key")) {
    return `Invalid reference in ${operation}. Please check your data.`;
  }

  // Not null violation
  if (code === "23502" || message.includes("not null")) {
    return `Missing required field for ${operation}.`;
  }

  // Permission denied
  if (message.includes("permission") || message.includes("policy")) {
    return `Permission denied for ${operation}. Please contact support.`;
  }

  // Generic fallback
  errorTracker.logError(`Database error during ${operation}`, { error, message, operation });
  return `${operation} failed. Please try again or contact support.`;
}
