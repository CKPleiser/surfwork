/**
 * Database Types
 * Generated from Supabase schema
 */

export type ProfileKind = "person" | "org";
export type OrganizationType = "school" | "camp" | "shop" | "agency" | "other";
export type JobStatus = "pending" | "active" | "closed";
export type RoleType = "coach" | "media" | "camp_staff" | "ops" | "other";
export type CompensationType = "salary" | "day_rate" | "exchange" | "volunteer" | "unknown";
export type AccommodationLevel = "yes" | "no" | "partial";
export type ContactMethod = "email" | "whatsapp" | "link";

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  kind: ProfileKind;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
}

export interface Organization {
  id: string;
  created_at: string;
  updated_at: string;
  owner_profile_id: string;
  name: string;
  org_type: OrganizationType;
  website: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  // Extended media fields
  about: string | null;
  description_rich: Record<string, unknown> | null;
  hero_image_url: string | null;
  gallery_images: string[];
  video_urls: string[];
  // Additional social media
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  // Metadata
  slug: string | null;
  featured: boolean;
}

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  status: JobStatus;
  title: string;
  role: RoleType;
  sports: string[];
  description: string;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  season_start: string | null;
  season_end: string | null;
  compensation: CompensationType;
  pay: string | null;
  accommodation: AccommodationLevel;
  contact: ContactMethod;
  contact_value: string;
  photo_url: string | null;
  attributes: Record<string, unknown>;
}

export interface JobWithOrganization extends Job {
  organization: Organization;
}
