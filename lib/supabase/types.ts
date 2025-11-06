/**
 * Database Types
 * Generated from Supabase schema - cleaned up unused tables
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          accommodation: Database["public"]["Enums"]["accommodation_lvl"]
          attributes: Json
          city: string | null
          compensation: Database["public"]["Enums"]["compensation_type"]
          contact: Database["public"]["Enums"]["contact_method"]
          contact_value: string
          country: string | null
          created_at: string
          description: string
          id: string
          lat: number | null
          lng: number | null
          organization_id: string
          pay: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["role_type"]
          season_end: string | null
          season_start: string | null
          sports: string[]
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          accommodation?: Database["public"]["Enums"]["accommodation_lvl"]
          attributes?: Json
          city?: string | null
          compensation?: Database["public"]["Enums"]["compensation_type"]
          contact: Database["public"]["Enums"]["contact_method"]
          contact_value: string
          country?: string | null
          created_at?: string
          description: string
          id?: string
          lat?: number | null
          lng?: number | null
          organization_id: string
          pay?: string | null
          photo_url?: string | null
          role: Database["public"]["Enums"]["role_type"]
          season_end?: string | null
          season_start?: string | null
          sports?: string[]
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          accommodation?: Database["public"]["Enums"]["accommodation_lvl"]
          attributes?: Json
          city?: string | null
          compensation?: Database["public"]["Enums"]["compensation_type"]
          contact?: Database["public"]["Enums"]["contact_method"]
          contact_value?: string
          country?: string | null
          created_at?: string
          description?: string
          id?: string
          lat?: number | null
          lng?: number | null
          organization_id?: string
          pay?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          season_end?: string | null
          season_start?: string | null
          sports?: string[]
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          about: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          facebook: string | null
          featured: boolean | null
          gallery_images: string[] | null
          hero_image_url: string | null
          id: string
          instagram: string | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          org_type: string
          owner_profile_id: string
          slug: string | null
          tiktok: string | null
          updated_at: string
          verified: boolean
          video_urls: string[] | null
          website: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          about?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          org_type?: string
          owner_profile_id: string
          slug?: string | null
          tiktok?: string | null
          updated_at?: string
          verified?: boolean
          video_urls?: string[] | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          about?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          facebook?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          org_type?: string
          owner_profile_id?: string
          slug?: string | null
          tiktok?: string | null
          updated_at?: string
          verified?: boolean
          video_urls?: string[] | null
          website?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          display_name: string
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          is_public: boolean | null
          kind: Database["public"]["Enums"]["profile_kind"]
          last_name: string | null
          links: Json | null
          skills: string[] | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          is_public?: boolean | null
          kind: Database["public"]["Enums"]["profile_kind"]
          last_name?: string | null
          links?: Json | null
          skills?: string[] | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_public?: boolean | null
          kind?: Database["public"]["Enums"]["profile_kind"]
          last_name?: string | null
          links?: Json | null
          skills?: string[] | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          job_id: string
          crew_id: string
          status: Database["public"]["Enums"]["application_status"]
          message: string
          viewed_at: string | null
          contacted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          crew_id: string
          status?: Database["public"]["Enums"]["application_status"]
          message: string
          viewed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          crew_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          message?: string
          viewed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_type_stats: {
        Row: {
          count: number | null
          org_type: string | null
          verified_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      accommodation_lvl: "yes" | "no" | "partial"
      application_status: "pending" | "viewed" | "contacted" | "archived"
      candidate_status: "active" | "archived"
      compensation_type:
        | "salary"
        | "day_rate"
        | "exchange"
        | "volunteer"
        | "unknown"
      contact_method: "email" | "whatsapp" | "link"
      job_status: "pending" | "active" | "closed"
      profile_kind: "person" | "org"
      role_type: "coach" | "media" | "camp_staff" | "ops" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type ProfileKind = Database["public"]["Enums"]["profile_kind"];
export type OrganizationType = "school" | "camp" | "shop" | "agency" | "other";
export type JobStatus = Database["public"]["Enums"]["job_status"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type RoleType = Database["public"]["Enums"]["role_type"];
export type CompensationType = Database["public"]["Enums"]["compensation_type"];
export type AccommodationLevel = Database["public"]["Enums"]["accommodation_lvl"];
export type ContactMethod = Database["public"]["Enums"]["contact_method"];

// Table row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];

// Extended types for common queries
export interface JobWithOrganization extends Job {
  organization: Organization;
}

export interface ApplicationWithDetails extends Application {
  job: Job & { organization: Organization };
  crew: Profile;
}
