/**
 * Crew Profile Edit Validation Schema
 * Reuses signup validation but excludes account creation fields
 */

import { z } from "zod";

// Role type enum matching database
export const roleTypeSchema = z.enum(["coach", "media", "camp_staff", "ops", "other"]);

// Contact method enum matching database
export const contactMethodSchema = z.enum(["email", "whatsapp", "link"]);

// Crew profile edit schema (excludes password/email since those are separate)
export const crewProfileEditSchema = z.object({
  // A. Personal Info
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),

  country: z.string().optional().or(z.literal("")),

  bio: z
    .string()
    .max(600, "Bio must be less than 600 characters")
    .optional()
    .or(z.literal("")),

  avatar_url: z
    .string()
    .url("Please provide a valid URL")
    .optional()
    .or(z.literal("")),

  is_public: z.boolean().optional(),

  // B. What's your craft? (optional for profile edit)
  roles: z
    .array(roleTypeSchema)
    .optional(),

  skills: z.array(z.string()).optional(),

  links: z.object({
    instagram: z.string().optional().or(z.literal("")),
    portfolio: z.string().optional().or(z.literal("")),
    site: z.string().optional().or(z.literal("")),
    whatsapp: z.string().optional().or(z.literal("")),
  }),

  about: z
    .string()
    .max(1500, "About your work must be less than 1500 characters")
    .optional()
    .or(z.literal("")),

  // C. Availability & Regions (optional for profile edit)
  availability_start: z
    .string()
    .optional()
    .or(z.literal("")),

  availability_end: z
    .string()
    .optional()
    .or(z.literal("")),

  preferred_regions: z.array(z.string()).optional(),

  open_to: z
    .array(z.enum(["salary", "day_rate", "exchange", "volunteer"]))
    .optional(),

  // D. Profile Pitch (optional for profile edit)
  pitch_title: z
    .string()
    .optional()
    .or(z.literal("")),

  pitch_description: z
    .string()
    .optional()
    .or(z.literal("")),

  contact_method: contactMethodSchema.optional(),

  contact_value: z.string().optional().or(z.literal("")),
});

// Type inference
export type CrewProfileEditFormData = z.infer<typeof crewProfileEditSchema>;

// Validation helper for contact_value based on contact_method
export function validateContactValue(
  method: "email" | "whatsapp" | "link",
  value: string
): boolean {
  switch (method) {
    case "email":
      return z.string().email().safeParse(value).success;
    case "link":
      return z.string().url().safeParse(value).success;
    case "whatsapp":
      // Basic phone number validation (digits and + allowed)
      return /^[\d+\s()-]+$/.test(value);
    default:
      return false;
  }
}
