/**
 * Applications Service Layer
 * Handles business logic for job applications
 */

import { createClient } from "@/lib/supabase/server";
import type { 
  Application, 
  ApplicationStatus, 
  ApplicationWithDetails 
} from "@/lib/supabase/types";

/**
 * Create a new job application
 */
export async function createApplication({
  jobId,
  message,
}: {
  jobId: string;
  message: string;
}): Promise<{ data: Application | null; error: string | null }> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: "Authentication required" };
  }

  // Validate message length
  if (message.length < 50 || message.length > 500) {
    return { data: null, error: "Message must be between 50 and 500 characters" };
  }

  // Create application
  const { data, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      crew_id: user.id,
      message,
      status: "pending" as ApplicationStatus,
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation
    if (error.code === "23505") {
      return { data: null, error: "You have already applied for this job" };
    }
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Check if user has applied to a job
 */
export async function hasUserAppliedToJob(
  jobId: string
): Promise<{ hasApplied: boolean; application: Application | null }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { hasApplied: false, application: null };
  }

  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("crew_id", user.id)
    .single();

  return { 
    hasApplied: !!data, 
    application: data 
  };
}

/**
 * Get user's applications with job details
 */
export async function getUserApplications(): Promise<{
  data: ApplicationWithDetails[];
  error: string | null;
}> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: [], error: "Authentication required" };
  }

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(
        *,
        organization:organizations(*)
      )
    `)
    .eq("crew_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  // Type assertion since Supabase doesn't infer nested relations properly
  return { 
    data: (data || []) as ApplicationWithDetails[], 
    error: null 
  };
}

/**
 * Get applications for organization's jobs
 */
export async function getOrganizationApplications(
  organizationId: string
): Promise<{
  data: ApplicationWithDetails[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs!inner(
        *,
        organization:organizations(*)
      ),
      crew:profiles(*)
    `)
    .eq("job.organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { 
    data: (data || []) as ApplicationWithDetails[], 
    error: null 
  };
}

/**
 * Update application status
 */
export async function updateApplicationStatus({
  applicationId,
  status,
  organizationId,
}: {
  applicationId: string;
  status: ApplicationStatus;
  organizationId: string;
}): Promise<{ data: Application | null; error: string | null }> {
  const supabase = await createClient();

  // First verify the application belongs to a job owned by the organization
  const { data: application } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs!inner(
        organization_id
      )
    `)
    .eq("id", applicationId)
    .single();

  if (!application) {
    return { data: null, error: "Application not found" };
  }

  if ((application as any).job.organization_id !== organizationId) {
    return { data: null, error: "Unauthorized" };
  }

  // Update status and set timestamps
  const updateData: any = { status };
  
  if (status === "viewed" && !application.viewed_at) {
    updateData.viewed_at = new Date().toISOString();
  } else if (status === "contacted" && !application.contacted_at) {
    updateData.contacted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get application statistics for an organization
 */
export async function getApplicationStats(
  organizationId: string
): Promise<{
  total: number;
  pending: number;
  viewed: number;
  contacted: number;
  archived: number;
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("applications")
    .select(`
      status,
      job:jobs!inner(organization_id)
    `)
    .eq("job.organization_id", organizationId);

  const stats = {
    total: 0,
    pending: 0,
    viewed: 0,
    contacted: 0,
    archived: 0,
  };

  if (data) {
    stats.total = data.length;
    data.forEach((app) => {
      const status = app.status as ApplicationStatus;
      stats[status]++;
    });
  }

  return stats;
}