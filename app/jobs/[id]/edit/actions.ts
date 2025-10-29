/**
 * Server Actions for Job Editing
 * Handle job updates and deletion with ownership verification
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { jobFormSchema, type JobFormData } from "@/lib/validations/job";

/**
 * Update an existing job post
 * Verifies ownership before allowing update
 */
export async function updateJob(jobId: string, formData: JobFormData) {
  const supabase = await createClient();

  // Validate form data
  const validatedData = jobFormSchema.parse(formData);

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to update a job",
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
      error: "Profile not found",
    };
  }

  // Verify job exists and user owns it
  const { data: existingJob, error: fetchError } = await supabase
    .from("jobs")
    .select("id, organization_id, organizations!inner(owner_profile_id)")
    .eq("id", jobId)
    .single();

  if (fetchError || !existingJob) {
    return {
      error: "Job not found",
    };
  }

  // Check ownership
  const organizationData = existingJob.organizations as unknown as { owner_profile_id: string };
  if (organizationData.owner_profile_id !== profile.id) {
    return {
      error: "You don't have permission to edit this job",
    };
  }

  // Update the job
  const { error: updateError } = await supabase
    .from("jobs")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateError) {
    console.error("Job update error:", updateError);
    return {
      error: "Failed to update job. Please try again.",
    };
  }

  // Revalidate relevant pages
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");

  // Redirect to job detail page
  redirect(`/jobs/${jobId}`);
}

/**
 * Delete (soft delete) a job post by setting status to closed
 * Verifies ownership before allowing deletion
 */
export async function deleteJob(jobId: string) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to delete a job",
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
      error: "Profile not found",
    };
  }

  // Verify job exists and user owns it
  const { data: existingJob, error: fetchError } = await supabase
    .from("jobs")
    .select("id, organization_id, organizations!inner(owner_profile_id)")
    .eq("id", jobId)
    .single();

  if (fetchError || !existingJob) {
    return {
      error: "Job not found",
    };
  }

  // Check ownership
  const organizationData = existingJob.organizations as unknown as { owner_profile_id: string };
  if (organizationData.owner_profile_id !== profile.id) {
    return {
      error: "You don't have permission to delete this job",
    };
  }

  // Soft delete by setting status to closed
  const { error: deleteError } = await supabase
    .from("jobs")
    .update({
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (deleteError) {
    console.error("Job deletion error:", deleteError);
    return {
      error: "Failed to delete job. Please try again.",
    };
  }

  // Revalidate relevant pages
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");

  // Redirect to dashboard
  redirect("/dashboard");
}
