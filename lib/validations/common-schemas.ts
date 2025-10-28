/**
 * Common Validation Schemas
 * Shared validation patterns used across signup forms
 */

import { z } from "zod";

/**
 * Reusable email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

/**
 * Password validation schema
 * Allows empty string for magic link signup
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .optional()
  .or(z.literal(""));

/**
 * Factory function for optional string fields
 * @param maxLength Optional maximum length for the string
 */
export function optionalStringSchema(maxLength?: number) {
  let schema = z.string().optional().or(z.literal(""));

  if (maxLength) {
    schema = z
      .string()
      .max(maxLength, `Must be ${maxLength} characters or less`)
      .optional()
      .or(z.literal(""));
  }

  return schema;
}

/**
 * Password confirmation refine function
 * Ensures password and confirmPassword match when password is provided
 */
export function passwordMatchRefine(
  data: { password?: string; confirmPassword?: string },
  ctx: z.RefinementCtx
) {
  if (data.password && data.password !== "") {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  }
}

/**
 * Contact value validation based on contact method
 * Validates email format for email, URL for links, phone pattern for WhatsApp
 */
export function contactValueByMethodRefine(
  data: { contact_method?: string; contact_value?: string },
  ctx: z.RefinementCtx
) {
  if (!data.contact_method || !data.contact_value) {
    return;
  }

  const method = data.contact_method;
  const value = data.contact_value;

  // Validate email format
  if (method === "email") {
    const emailResult = z.string().email().safeParse(value);
    if (!emailResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
        path: ["contact_value"],
      });
    }
  }

  // Validate URL format
  if (method === "link") {
    const urlResult = z.string().url().safeParse(value);
    if (!urlResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid URL",
        path: ["contact_value"],
      });
    }
  }

  // Validate phone/WhatsApp format (basic check)
  if (method === "whatsapp") {
    const phonePattern = /^[\d+\s()-]+$/;
    if (!phonePattern.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid phone number",
        path: ["contact_value"],
      });
    }
  }
}

/**
 * Optional URL validation schema
 */
export const optionalUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""));

/**
 * Country validation (requires non-empty string from COUNTRIES list)
 */
export const countrySchema = z.string().min(1, "Please select a country");
