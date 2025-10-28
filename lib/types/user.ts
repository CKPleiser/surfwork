/**
 * Shared User Type Definitions
 * Common types for user and profile data across the application
 */

import type { User } from "@supabase/supabase-js";

/**
 * Profile kind from database
 */
export type ProfileKind = "person" | "org";

/**
 * User profile information from profiles table
 */
export interface UserProfile {
  id: string;
  kind: ProfileKind;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
  slug: string | null;
  country: string | null;
  bio: string | null;
  about: string | null;
  is_public: boolean | null;
  is_admin: boolean;
  skills: string[] | null;
  links: unknown | null;
}

/**
 * Extended user with profile information
 * Used in server components and authentication flows
 */
export interface UserWithProfile extends User {
  profile?: UserProfile;
}
