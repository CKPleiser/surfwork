import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

interface Job {
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

async function fetchJobs(): Promise<Job[]> {
  const supabase = createClient();

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
    // Provide user-friendly error message
    if (error.message.includes("fetch")) {
      throw new Error("Unable to load jobs. Please check your connection and try again.");
    }
    throw new Error("Failed to load jobs. Please refresh the page.");
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

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.list(),
    queryFn: fetchJobs,
    staleTime: 2 * 60 * 1000, // 2 minutes - job listings update moderately
  });
}
