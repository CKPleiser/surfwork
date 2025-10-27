import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface LocationSuggestion {
  label: string;
  value: string;
  type: "country" | "city";
  jobCount: number;
}

async function fetchLocationSuggestions(
  query: string
): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const supabase = createClient();

  // Fetch all active jobs with location data
  const { data, error } = await supabase
    .from("jobs")
    .select("country, city")
    .eq("status", "active")
    .or(`country.ilike.%${query}%,city.ilike.%${query}%`)
    .not("country", "is", null);

  if (error) {
    console.error("Error fetching location suggestions:", error);
    throw error;
  }

  // Group by country and city
  const countryMap = new Map<string, number>();
  const cityMap = new Map<string, { city: string; country: string; count: number }>();

  data.forEach((job) => {
    // Count countries
    if (job.country) {
      countryMap.set(job.country, (countryMap.get(job.country) || 0) + 1);
    }

    // Count cities
    if (job.city && job.country) {
      const key = `${job.city}, ${job.country}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, { city: job.city, country: job.country, count: 0 });
      }
      cityMap.get(key)!.count += 1;
    }
  });

  // Convert to suggestions array
  const suggestions: LocationSuggestion[] = [];

  // Add country suggestions
  Array.from(countryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([country, count]) => {
      suggestions.push({
        label: country,
        value: country,
        type: "country",
        jobCount: count,
      });
    });

  // Add city suggestions
  Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .forEach(({ city, country, count }) => {
      suggestions.push({
        label: `${city}, ${country}`,
        value: `${city}, ${country}`,
        type: "city",
        jobCount: count,
      });
    });

  return suggestions.slice(0, 10); // Max 10 suggestions
}

export function useLocationAutocomplete(query: string, enabled = true) {
  return useQuery({
    queryKey: ["location-autocomplete", query],
    queryFn: () => fetchLocationSuggestions(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: enabled && query.length >= 2, // Only query if at least 2 characters
  });
}
