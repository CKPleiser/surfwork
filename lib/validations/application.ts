/**
 * Validation schemas for job applications
 */

import { z } from "zod";

export const applicationMessageSchema = z.object({
  message: z
    .string()
    .min(50, "Application message must be at least 50 characters")
    .max(500, "Application message cannot exceed 500 characters")
    .refine(
      (val) => {
        // Check for minimum word count (roughly 10 words)
        const wordCount = val.trim().split(/\s+/).length;
        return wordCount >= 10;
      },
      {
        message: "Please provide a more detailed message (at least 10 words)",
      }
    ),
});

export const applicationStatusSchema = z.enum([
  "pending",
  "viewed",
  "contacted",
  "archived",
] as const);

export type ApplicationFormData = z.infer<typeof applicationMessageSchema>;
export type ApplicationStatusType = z.infer<typeof applicationStatusSchema>;