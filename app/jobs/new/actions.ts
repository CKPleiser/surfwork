/**
 * Server Actions for Job Posting
 * Handle job creation with authentication and validation
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { jobFormSchema, type JobFormData } from "@/lib/validations/job";

export async function createJob(formData: JobFormData) {
  const supabase = await createClient();

  // Validate form data
  const validation = jobFormSchema.safeParse(formData);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      if (err.path[0]) {
        fieldErrors[err.path[0] as string] = err.message;
      }
    });
    return {
      error: "Please fix the errors in the form",
      fieldErrors,
    };
  }

  const validatedData = validation.data;

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to post a job",
    };
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      error: "Profile not found. Please complete your profile first.",
    };
  }

  // Get or create organization for this user
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_profile_id", profile.id)
    .single();

  if (organizationError || !organization) {
    return {
      error: "Organization profile required. Please create an organization profile first.",
    };
  }

  // Create the job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      organization_id: organization.id,
      title: validatedData.title,
      role: validatedData.role,
      sports: validatedData.sports,
      description: validatedData.description,
      city: validatedData.city || null,
      country: validatedData.country,
      season_start: validatedData.season_start || null,
      season_end: validatedData.season_end || null,
      compensation: validatedData.compensation,
      pay: validatedData.pay || null,
      accommodation: validatedData.accommodation,
      contact: validatedData.contact,
      contact_value: validatedData.contact_value,
      photo_url: validatedData.photo_url || null,
      status: "pending", // Jobs start as pending for moderation
    })
    .select()
    .single();

  if (jobError) {
    console.error("Job creation error:", jobError);
    return {
      error: "Failed to create job. Please try again.",
    };
  }

  // Revalidate jobs page
  revalidatePath("/jobs");

  // Redirect to job detail page
  if (!job.id) {
    return {
      error: "Invalid job ID generated",
    };
  }

  redirect(`/jobs/${job.id}`);
}
