"use client";

import { usePopularDestinations } from "@/lib/queries/usePopularDestinations";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Role emoji mapping
const ROLE_EMOJIS: Record<string, string> = {
  coach: "🏄",
  media: "📸",
  camp_staff: "🏕️",
  ops: "⚙️",
  other: "➕",
};

// Country flag emojis
const COUNTRY_FLAGS: Record<string, string> = {
  Portugal: "🇵🇹",
  Indonesia: "🇮🇩",
  "Costa Rica": "🇨🇷",
  Morocco: "🇲🇦",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Mexico: "🇲🇽",
  Australia: "🇦🇺",
  Brazil: "🇧🇷",
  "South Africa": "🇿🇦",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
};

function DestinationCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-ocean-200 bg-white shadow-lg">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PopularDestinations() {
  const { data: destinations, isLoading } = usePopularDestinations();

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-cream-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                Popular Destinations
              </h2>
              <p className="text-muted-foreground mt-2">
                Explore surf jobs in these hotspots
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <DestinationCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-cream-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground mt-2">
              Explore surf jobs in these hotspots
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <Link
                key={destination.country}
                href={`/jobs?location=${encodeURIComponent(destination.country)}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl border-2 border-ocean-200 bg-white shadow-lg hover:shadow-2xl hover:scale-105 hover:border-ocean-300 transition-all duration-300">
                  {/* Destination Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={destination.imageUrl}
                      alt={destination.country}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Country name on image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">
                          {COUNTRY_FLAGS[destination.country] || "🌍"}
                        </span>
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {destination.country}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Job Count */}
                    <p className="text-sm text-muted-foreground mb-3">
                      <span className="font-bold text-ocean-600">
                        {destination.jobCount}
                      </span>{" "}
                      {destination.jobCount === 1 ? "job" : "jobs"} available
                    </p>

                    {/* Popular Roles */}
                    {destination.popularRoles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {destination.popularRoles.map((role: string) => (
                          <span
                            key={role}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-ocean-50 text-ocean-700 rounded-full text-xs font-medium border border-ocean-200"
                          >
                            <span>{ROLE_EMOJIS[role] || "•"}</span>
                            <span className="capitalize">
                              {role.replace("_", " ")}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hover effect indicator */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-4 h-4 text-ocean-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
