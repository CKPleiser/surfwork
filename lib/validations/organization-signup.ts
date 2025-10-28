/**
 * Organization Signup Form Validation Schema
 * Comprehensive validation for organization registration
 */

import { z } from "zod";

// Organization type enum matching database
export const orgTypeSchema = z.enum(["school", "camp", "shop", "agency", "other"]);

// Social media username validator - removes @ symbol if present
const socialHandleSchema = z
  .string()
  .transform((val) => val.replace(/^@/, ""))
  .optional()
  .or(z.literal(""));

// Main organization signup schema
export const organizationSignupSchema = z.object({
  // Section 1: About Your Organization
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must not exceed 100 characters"),

  org_type: orgTypeSchema,

  country: z.string().min(1, "Please select a country"),

  city: z
    .string()
    .max(100, "City must not exceed 100 characters")
    .optional()
    .or(z.literal("")),

  about: z
    .string()
    .max(600, "About section must not exceed 600 characters")
    .optional()
    .or(z.literal("")),

  // Section 2: Contact & Social (all optional)
  website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  instagram: socialHandleSchema,

  whatsapp: z
    .string()
    .optional()
    .or(z.literal("")),

  // Section 3: Create Your Account
  contact_name: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must not exceed 100 characters"),

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
export type OrganizationSignupFormData = z.infer<typeof organizationSignupSchema>;

// Validation helper function
export function validateOrganizationSignup(data: unknown): {
  success: boolean;
  data?: OrganizationSignupFormData;
  errors?: Record<string, string>;
} {
  const result = organizationSignupSchema.safeParse(data);

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
