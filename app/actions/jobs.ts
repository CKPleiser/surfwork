"use server";

import { createClient } from "@/lib/supabase/server";

export interface Job {
  id: string;
  title: string;
  location: string;
  tags: string[];
  accommodation: boolean;
  pay?: string;
  campName: string;
  city?: string;
  country?: string;
  role?: string;
  created_at: string;
}

export async function getActiveJobs(): Promise<Job[]> {
  const supabase = await createClient();

  const { data: dbJobs, error } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      city,
      country,
      role,
      accommodation,
      pay,
      created_at,
      organization:organizations(name)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getActiveJobs] Error:", error);
    return [];
  }

  if (!dbJobs) {
    return [];
  }

  return dbJobs.map((job: any) => ({
    id: job.id,
    title: job.title,
    location: [job.city, job.country].filter(Boolean).join(", "),
    tags: [job.role],
    accommodation: job.accommodation === "yes",
    pay: job.pay,
    campName: job.organization?.name || "Surf Camp",
    city: job.city,
    country: job.country,
    role: job.role,
    created_at: job.created_at,
  }));
}
