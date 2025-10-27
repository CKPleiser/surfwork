/**
 * Job Preview Page
 * Shows job after submission with pending status message
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

interface JobPreviewPageProps {
  params: {
    id: string;
  };
}

export default async function JobPreviewPage({ params }: JobPreviewPageProps) {
  const supabase = createClient();

  // Fetch the job
  const { data: job } = await supabase
    .from("jobs")
    .select("*, organization:organizations(*)")
    .eq("id", params.id)
    .single();

  if (!job) {
    notFound();
  }

  const isPending = job.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-content px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-form px-4 py-12">
        {/* Success Message */}
        <div className="mb-8 text-center animate-fade-up">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
            {isPending ? (
              <Clock className="h-12 w-12 text-primary" strokeWidth={1.5} />
            ) : (
              <Check className="h-12 w-12 text-success" strokeWidth={2} />
            )}
          </div>
          <h1 className="mb-2 text-4xl font-semibold">
            {isPending ? "Job Submitted!" : "Job Active"}
          </h1>
          <p className="text-base text-text-secondary">
            {isPending
              ? "We&apos;ll review it and get it live within 24 hours"
              : "Your job is now live and visible to coaches"}
          </p>
        </div>

        {/* Job Preview Card */}
        <Card className="mb-8 stagger-item">
          <CardContent className="pt-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{job.title}</h2>
              <p className="text-text-secondary">
                {job.city && `${job.city}, `}
                {job.country}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-text-primary/70 w-24">
                  Role:
                </span>
                <span className="text-sm text-text-secondary capitalize">
                  {job.role}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-text-primary/70 w-24">
                  Sports:
                </span>
                <div className="flex flex-wrap gap-2">
                  {job.sports.map((sport: string) => (
                    <span key={sport} className="chip text-xs capitalize">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
              {job.pay && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-text-primary/70 w-24">
                    Pay:
                  </span>
                  <span className="text-sm text-text-secondary">{job.pay}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-text-primary/70 w-24">
                  Housing:
                </span>
                <span className="text-sm text-text-secondary capitalize">
                  {job.accommodation === "yes"
                    ? "Included"
                    : job.accommodation === "partial"
                    ? "Partial"
                    : "Not Included"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 stagger-item" style={{ animationDelay: "80ms" }}>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-lg font-semibold">What Happens Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Review</p>
                  <p className="text-xs text-text-secondary">
                    We&apos;ll check your listing to keep the board spam-free
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Go Live</p>
                  <p className="text-xs text-text-secondary">
                    Your job will be visible to coaches within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Applications</p>
                  <p className="text-xs text-text-secondary">
                    Coaches will contact you directly via {job.contact}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary text-center">
            Browse Other Jobs
          </Link>
          <Link href="/jobs/new" className="btn-secondary text-center">
            Post Another Job
          </Link>
        </div>
      </main>
    </div>
  );
}
