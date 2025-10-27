/**
 * Job Form Validation Schema
 * Zod validation for job posting form
 */

import { z } from "zod";

export const jobFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),

  role: z
    .enum(["coach", "media", "camp_staff", "ops", "other"])
    .refine((val) => val !== undefined, {
      message: "Please select a role",
    }),

  sports: z
    .array(z.string())
    .min(1, "Select at least one sport")
    .default(["surf"]),

  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),

  city: z.string().optional(),

  country: z
    .string()
    .min(2, "Please enter a country")
    .max(100, "Country name too long"),

  season_start: z.string().optional(),

  season_end: z.string().optional(),

  compensation: z
    .enum(["salary", "day_rate", "exchange", "volunteer", "unknown"])
    .refine((val) => val !== undefined, {
      message: "Please select a compensation type",
    }),

  pay: z.string().optional(),

  accommodation: z
    .enum(["yes", "no", "partial"])
    .refine((val) => val !== undefined, {
      message: "Please specify accommodation availability",
    }),

  contact: z
    .enum(["email", "whatsapp", "link"])
    .refine((val) => val !== undefined, {
      message: "Please select a contact method",
    }),

  contact_value: z
    .string()
    .min(3, "Please provide valid contact information")
    .max(200, "Contact information too long"),

  photo_url: z.string().url().optional().or(z.literal("")),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
