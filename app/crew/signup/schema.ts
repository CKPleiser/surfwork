/**
 * Crew Signup Form Validation Schema
 * Comprehensive validation for crew member registration
 *
 * Route-local schema to prevent Zod from landing in commons chunk
 */

import { z } from "zod";

// Role type enum matching database
export const roleTypeSchema = z.enum(["coach", "media", "camp_staff", "ops", "other"]);

// Contact method enum matching database
export const contactMethodSchema = z.enum(["email", "whatsapp", "link"]);

// Main crew signup schema
export const crewSignupSchema = z.object({
  // A. Personal Info (Step 1)
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),

  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),

  // B. Account (Step 3 - Final)
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  confirmPassword: z
    .string()
    .optional()
    .or(z.literal("")),

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

  // C. What's your craft?
  roles: z
    .array(roleTypeSchema)
    .min(1, "Please select at least one role"),

  skills: z.array(z.string()).optional(),

  links: z.object({
    instagram: z.string(),
    portfolio: z.string(),
    site: z.string(),
    whatsapp: z.string(),
  }),

  about: z
    .string()
    .max(1500, "About your work must be less than 1500 characters")
    .optional()
    .or(z.literal("")),

  // D. Availability & Regions
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

  // E. Profile Pitch
  pitch_title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must be less than 80 characters"),

  pitch_description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(800, "Description must be less than 800 characters"),

  contact_method: contactMethodSchema,

  contact_value: z.string().min(1, "Contact value is required"),
}).refine((data) => {
  // Only validate password match if password is provided
  if (data.password && data.password !== "") {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type inference
export type CrewSignupFormData = z.infer<typeof crewSignupSchema>;

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
