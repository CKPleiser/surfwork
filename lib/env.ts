/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */

import { z } from "zod";

const envSchema = z.object({
  // Supabase - Required
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z
    .string()
    .min(1, "Supabase publishable key is required"),
  SUPABASE_SECRET_KEY: z.string().min(1, "Supabase secret key is required"),

  // Application - Required
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid application URL"),

  // Stripe - Optional (for future payment features)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Resend - Optional (for future email features)
  RESEND_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables at startup
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );

    throw new Error(
      `Environment validation failed:\n${errors.join("\n")}\n\nPlease check your .env.local file and ensure all required variables are set.`
    );
  }

  return parsed.data;
}

/**
 * Safely access validated environment variables
 * Call validateEnv() first during app initialization
 */
export const env = validateEnv();
