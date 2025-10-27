/**
 * Profile Validation Schema
 * Validation for profile updates
 */

import { z } from "zod";

export const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(60, "Display name must be less than 60 characters")
    .optional(),

  kind: z.enum(["person", "org"]).optional(),

  country: z.string().optional(),

  bio: z
    .string()
    .max(600, "Bio must be less than 600 characters")
    .optional(),

  avatar_url: z.string().url("Please provide a valid URL").optional(),

  skills: z.array(z.string()).optional(),

  links: z
    .object({
      instagram: z.string().url().optional().or(z.literal("")),
      portfolio: z.string().url().optional().or(z.literal("")),
      site: z.string().url().optional().or(z.literal("")),
      whatsapp: z.string().optional().or(z.literal("")),
    })
    .optional(),

  about: z
    .string()
    .max(1500, "About section must be less than 1500 characters")
    .optional(),

  is_public: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
