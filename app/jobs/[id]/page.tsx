/**
 * Job Detail Page
 * Handcrafted job listing detail view
 * Feels like reading a surf camp flyer
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, DollarSign, Home, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { JobWithOrganization } from "@/lib/supabase/types";
import { ContactButtons } from "./contact-buttons";
import { JobCard } from "@/components/JobCard";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

async function getJob(id: string) {
  const supabase = await createClient();

  // Fetch the job (allow viewing pending jobs for now - moderation can be added later)
  const { data: jobData, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (jobError || !jobData) {
    return null;
  }

  // Fetch the organization
  const { data: organizationData, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", jobData.organization_id)
    .single();

  if (organizationError || !organizationData) {
    return null;
  }

  // Fetch related jobs (same role, different job, limit 3)
  const { data: relatedJobs } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      city,
      country,
      role,
      accommodation,
      pay,
      organization:organizations(name)
    `)
    .eq("status", "active")
    .eq("role", jobData.role)
    .neq("id", id)
    .limit(3);

  // Combine into result
  const job = {
    ...jobData,
    organization: organizationData,
  } as JobWithOrganization;

  return { job, relatedJobs: relatedJobs || [] };
}

function formatPostedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted yesterday";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;
  if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  return `Posted ${Math.floor(diffDays / 30)} months ago`;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const result = await getJob(params.id);

  if (!result) {
    notFound();
  }

  const { job, relatedJobs } = result;

  // Format location
  const location = [job.city, job.country].filter(Boolean).join(", ");

  // Format role for display
  const roleLabels: Record<string, string> = {
    coach: "Coach",
    media: "Media",
    camp_staff: "Camp Staff",
    ops: "Operations",
    other: "Other",
  };

  const roleLabel = roleLabels[job.role] || job.role;
  const postedDate = formatPostedDate(job.created_at);
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </Link>
        </div>

        {/* Hero section */}
        <div className="mb-8 space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm">
              {roleLabel}
            </Badge>
            {job.accommodation === "yes" && (
              <Badge variant="secondary" className="text-sm">
                Accommodation
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-ocean bg-clip-text text-transparent">{job.title}</h1>

          <div className="flex items-center gap-2 text-muted-foreground text-lg">
            <MapPin className="h-5 w-5" />
            <span>{location}</span>
          </div>

          {/* Posted by organization */}
          <div className="flex items-center gap-3 pt-4">
            <div className="h-12 w-12 rounded-full bg-gradient-ocean flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-ocean-500/20">
              {job.organization.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/o/${job.organization.slug || job.organization.id}`}
                  className="hover:text-ocean-600 transition-colors font-bold text-lg"
                >
                  {job.organization.name}
                </Link>
                {job.organization.verified && (
                  <CheckCircle className="h-5 w-5 text-ocean-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{postedDate}</p>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Image and Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-border">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1613378143355-5e3e681cfcef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJmaW5nJTIwb2NlYW4lMjB3YXZlc3xlbnwxfHx8fDE3NjEwNDAzNjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={job.title}
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h2 className="mb-4 text-3xl font-bold text-foreground">About this role</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line text-lg leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Microcopy */}
            <p className="text-xs text-muted-foreground italic">
              Please keep things respectful — we&apos;re all here for the waves.
            </p>
          </div>

          {/* Right column - Job details and apply */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6 bg-white border-2 border-border">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">Job Details</h3>
                <div className="space-y-4">
                  {job.pay && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Compensation</p>
                        <p className="font-medium">{job.pay}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Accommodation</p>
                      <p className="font-medium">
                        {job.accommodation === "yes" ? "Included" :
                         job.accommodation === "partial" ? "Partial" : "Not included"}
                      </p>
                    </div>
                  </div>
                  {location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <ContactButtons
                contactMethod={job.contact}
                contactValue={job.contact_value}
                jobTitle={job.title}
                jobId={job.id}
              />

              <p className="text-xs text-center text-muted-foreground">
                Your application goes directly to {job.organization.name}
              </p>
            </Card>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">Similar opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relatedJob: any) => (
                <JobCard
                  key={relatedJob.id}
                  id={relatedJob.id}
                  title={relatedJob.title}
                  location={[relatedJob.city, relatedJob.country].filter(Boolean).join(", ")}
                  tags={[relatedJob.role]}
                  accommodation={relatedJob.accommodation === "yes"}
                  pay={relatedJob.pay}
                  campName={relatedJob.organization?.name || "Surf Camp"}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
