import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface PopularDestination {
  country: string;
  jobCount: number;
  popularRoles: string[];
  imageUrl: string;
}

// Unsplash images for popular surf destinations
const DESTINATION_IMAGES: Record<string, string> = {
  Portugal:
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Indonesia:
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  "Costa Rica":
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Morocco:
    "https://images.unsplash.com/photo-1539768942893-daf53e448371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  France:
    "https://images.unsplash.com/photo-1549144511-f099e773c147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Spain:
    "https://images.unsplash.com/photo-1543783207-ec64e4d95325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Mexico:
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Australia:
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
};

async function fetchPopularDestinations(): Promise<PopularDestination[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("country, role")
    .eq("status", "active")
    .not("country", "is", null);

  if (error) {
    console.error("Error fetching popular destinations:", error);
    throw error;
  }

  // Group by country and count jobs
  const countryMap = new Map<string, { count: number; roles: Set<string> }>();

  data.forEach((job) => {
    if (!job.country) return;

    if (!countryMap.has(job.country)) {
      countryMap.set(job.country, { count: 0, roles: new Set() });
    }

    const entry = countryMap.get(job.country)!;
    entry.count += 1;
    if (job.role) {
      entry.roles.add(job.role);
    }
  });

  // Convert to array and sort by job count
  const destinations: PopularDestination[] = Array.from(countryMap.entries())
    .map(([country, { count, roles }]) => ({
      country,
      jobCount: count,
      popularRoles: Array.from(roles).slice(0, 3), // Top 3 roles
      imageUrl: DESTINATION_IMAGES[country] || DESTINATION_IMAGES.Portugal || "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", // Fallback image
    }))
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, 6); // Top 6 destinations

  return destinations;
}

export function usePopularDestinations() {
  return useQuery({
    queryKey: ["popular-destinations"],
    queryFn: fetchPopularDestinations,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
}
