/**
 * Organization Profile Validation Schemas
 * Zod schemas for validating organization profile data
 */

import { z } from "zod";

/**
 * YouTube URL validation regex
 * Matches: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
 */
const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;

/**
 * Vimeo URL validation regex
 * Matches: vimeo.com/12345, player.vimeo.com/video/12345
 */
const VIMEO_REGEX = /^(https?:\/\/)?(www\.)?(vimeo\.com\/|player\.vimeo\.com\/video\/)[\d]+/;

/**
 * Video URL validator - accepts YouTube or Vimeo URLs
 */
const videoUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => YOUTUBE_REGEX.test(url) || VIMEO_REGEX.test(url),
    "Must be a YouTube or Vimeo URL"
  );

/**
 * Social media username validator - removes @ symbol if present
 */
const socialHandleSchema = z
  .string()
  .transform((val) => val.replace(/^@/, ""))
  .optional()
  .or(z.literal(""));

/**
 * Complete organization profile form schema
 */
export const organizationProfileSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  about: z
    .string()
    .max(2000, "About section must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),

  // Location
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),

  // Contact Information
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Must be a valid email")
    .optional()
    .or(z.literal("")),

  whatsapp: z
    .string()
    .optional()
    .or(z.literal("")),

  // Social Media
  instagram: socialHandleSchema,
  facebook: socialHandleSchema,
  youtube: socialHandleSchema,
  tiktok: socialHandleSchema,

  // Media
  hero_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  gallery_images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(10, "Maximum 10 gallery images allowed")
    .default([]),

  video_urls: z
    .array(videoUrlSchema)
    .max(5, "Maximum 5 videos allowed")
    .default([]),
});

/**
 * Type inference from schema
 */
export type OrganizationProfileFormData = z.infer<typeof organizationProfileSchema>;

/**
 * Partial update schema - all fields optional for PATCH operations
 */
export const organizationProfileUpdateSchema = organizationProfileSchema.partial();

export type OrganizationProfileUpdateData = z.infer<typeof organizationProfileUpdateSchema>;

/**
 * Validation helper function
 */
export function validateOrganizationProfile(data: unknown): {
  success: boolean;
  data?: OrganizationProfileFormData;
  errors?: Record<string, string>;
} {
  const result = organizationProfileSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { success: false, errors };
}
