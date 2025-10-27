/**
 * Slug Generation Utility
 * Generate URL-friendly slugs from display names
 */

import { createClient } from "@/lib/supabase/client";

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
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
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
 */
export async function generateUniqueSlug(displayName: string): Promise<string> {
  const baseSlug = slugify(displayName);

  // Check if base slug is available
  if (await isSlugAvailable(baseSlug)) {
    return baseSlug;
  }

  // Try appending numbers until we find an available slug
  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;

  while (!(await isSlugAvailable(candidateSlug))) {
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
