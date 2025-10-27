/**
 * Server Actions for Job Interactions
 * Handle saving/unsaving jobs for authenticated users
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveJob(jobId: string) {
  const supabase = createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to save jobs",
    };
  }

  // Save the job
  const { error: saveError } = await supabase
    .from("saved_jobs")
    .insert({
      profile_id: user.id,
      job_id: jobId,
    });

  if (saveError) {
    console.error("Save job error:", saveError);
    return {
      error: "Failed to save job. Please try again.",
    };
  }

  // Revalidate relevant pages
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/saved");

  return { success: true };
}

export async function unsaveJob(jobId: string) {
  const supabase = createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "You must be logged in to unsave jobs",
    };
  }

  // Unsave the job
  const { error: unsaveError } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("profile_id", user.id)
    .eq("job_id", jobId);

  if (unsaveError) {
    console.error("Unsave job error:", unsaveError);
    return {
      error: "Failed to unsave job. Please try again.",
    };
  }

  // Revalidate relevant pages
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/saved");

  return { success: true };
}

export async function checkIfJobSaved(jobId: string): Promise<boolean> {
  const supabase = createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Check if job is saved
  const { data } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("profile_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  return !!data;
}
