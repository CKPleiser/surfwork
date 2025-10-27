import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

interface Job {
  id: string;
  title: string;
  location: string;
  tags: string[];
  accommodation: boolean;
  campName: string;
}

async function fetchLatestJobs(): Promise<Job[]> {
  const supabase = createClient();

  const { data: dbJobs, error } = await supabase
    .from("jobs")
    .select("id, title, country, role, accommodation, city")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("[useLatestJobs] Fetch error:", error);
    throw new Error(`Failed to fetch latest jobs: ${error.message}`);
  }

  return dbJobs.map((job: any) => ({
    id: job.id,
    title: job.title,
    location: job.city ? `${job.city}, ${job.country}` : job.country,
    tags: [job.role],
    accommodation: job.accommodation === "yes",
    campName: "Surf Camp",
  }));
}

export function useLatestJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.latest(3),
    queryFn: fetchLatestJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes - homepage data changes infrequently
  });
}
