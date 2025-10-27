"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrganizationCardSkeleton } from "@/components/skeletons/OrganizationCardSkeleton";

interface OrganizationWithJobs {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
  verified: boolean;
  activeJobs: {
    id: string;
    title: string;
    role: string;
  }[];
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationWithJobs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const supabase = createClient();

        // Fetch all organizations
        const { data: dbOrganizations, error: orgsError } = await supabase
          .from("organizations")
          .select("id, name, slug, city, country, verified")
          .order("created_at", { ascending: false });

        if (orgsError) {
          if (orgsError.message.includes("fetch")) {
            throw new Error("Unable to load organizations. Please check your connection and try again.");
          }
          throw new Error("Failed to load organizations. Please refresh the page.");
        }

        if (dbOrganizations) {
          // Fetch active jobs for each organization
          const organizationsWithJobs = await Promise.all(
            dbOrganizations.map(async (organization) => {
              const { data: jobs } = await supabase
                .from("jobs")
                .select("id, title, role")
                .eq("organization_id", organization.id)
                .eq("status", "active")
                .limit(3);

              return {
                ...organization,
                activeJobs: jobs || [],
              };
            })
          );

          setOrganizations(organizationsWithJobs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  const roleLabels: Record<string, string> = {
    coach: "Coach",
    media: "Media",
    camp_staff: "Camp Staff",
    ops: "Operations",
    other: "Other",
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-ocean bg-clip-text text-transparent">Surf Organizations</h1>
          <p className="text-lg text-muted-foreground">
            Discover surf schools, camps, shops, and agencies looking for talented team members
          </p>
        </div>

        {error ? (
          <ErrorMessage
            title="Failed to load organizations"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </div>
        ) : organizations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organizations.map((organization) => (
              <Link key={organization.id} href={`/o/${organization.slug || organization.id}`}>
                <Card className="group p-6 cursor-pointer bg-white border-2 border-border hover:border-ocean-400 hover:shadow-xl transition-all duration-200">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-ocean flex items-center justify-center text-2xl text-white font-bold flex-shrink-0 shadow-lg shadow-ocean-500/20 ring-2 ring-ocean-100 group-hover:ring-ocean-300 transition-all">
                        {organization.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold truncate group-hover:text-ocean-600 transition-colors">
                            {organization.name}
                          </h3>
                          {organization.verified && (
                            <CheckCircle className="h-5 w-5 text-ocean-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {organization.city && organization.country
                              ? `${organization.city}, ${organization.country}`
                              : organization.city || organization.country || "Location not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Jobs */}
                    {organization.activeJobs.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground">
                            {organization.activeJobs.length} active{" "}
                            {organization.activeJobs.length === 1 ? "position" : "positions"}
                          </span>
                          <ExternalLink className="h-4 w-4 text-ocean-500" />
                        </div>
                        <div className="space-y-2">
                          {organization.activeJobs.map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-3 bg-cream-50 rounded-lg border-2 border-border hover:border-ocean-300 transition-colors"
                            >
                              <span className="text-sm font-medium truncate flex-1">{job.title}</span>
                              <Badge variant="secondary" className="text-xs ml-2">
                                {roleLabels[job.role] || job.role}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏄</div>
            <h3 className="text-2xl font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground">
              Check back soon for surf organizations
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center py-12 border-t border-border">
          <p className="text-muted-foreground mb-4">
            Run a surf organization? List your business and open positions.
          </p>
          <Link href="/post-job" className="text-sm text-primary hover:underline">
            Post a job →
          </Link>
        </div>
      </div>
    </div>
  );
}
