/**
 * Slug Generation Utility
 * Generate URL-friendly slugs from display names
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Convert a string to a URL-friendly slug
 * - Lowercase
 * - Replace spaces with dashes
 * - Remove special characters
 * - Keep only a-z, 0-9, and dashes
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^\w\-]+/g, "") // Remove non-word chars except dashes
    .replace(/\-\-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+/, "") // Trim dashes from start
    .replace(/-+$/, "") // Trim dashes from end
    .substring(0, 40); // Limit to 40 chars
}

/**
 * Check if a slug is available in the database
 * @param slug Slug to check
 * @param supabaseClient Supabase client (browser or server)
 */
export async function isSlugAvailable(
  slug: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[isSlugAvailable] Error checking slug:", error);
    return false;
  }

  return data === null;
}

/**
 * Generate a unique slug from a display name
 * If the base slug exists, append a number
 * @param displayName Display name to convert to slug
 * @param supabaseClient Supabase client (browser or server)
 */
export async function generateUniqueSlug(
  displayName: string,
  supabaseClient: SupabaseClient
): Promise<string> {
  const baseSlug = slugify(displayName);

  // Check if base slug is available
  if (await isSlugAvailable(baseSlug, supabaseClient)) {
    return baseSlug;
  }

  // Try appending numbers until we find an available slug
  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (!(await isSlugAvailable(candidateSlug, supabaseClient))) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;

    // Prevent infinite loop
    if (counter > 100) {
      throw new Error("Unable to generate unique slug");
    }
  }

  return candidateSlug;
}

/**
 * Validate slug format
 * Must match: ^[a-z0-9-]{3,40}$
 */
export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(slug);
}
