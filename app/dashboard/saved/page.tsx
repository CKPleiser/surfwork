import { AuthGuard } from "@/components/AuthGuard";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";
import { SaveJobButton } from "@/components/SaveJobButton";
import { ErrorMessage } from "@/components/ErrorMessage";

async function SavedJobsContent() {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch saved jobs with job details
  const { data: savedJobs, error } = await supabase
    .from("saved_jobs")
    .select(`
      id,
      created_at,
      job_id,
      jobs (
        id,
        title,
        role,
        sports,
        city,
        country,
        season_start,
        season_end,
        compensation,
        pay,
        accommodation,
        organization:organizations (
          name,
          slug
        )
      )
    `)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    const errorMessage = error.message.includes("fetch")
      ? "Unable to load saved jobs. Please check your connection and try again."
      : "Failed to load saved jobs. Please refresh the page.";

    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl tracking-tight mb-2">Saved Jobs</h1>
            <p className="text-muted-foreground">
              Jobs you&apos;ve bookmarked for later reference
            </p>
          </div>
          <ErrorMessage
            title="Failed to load saved jobs"
            message={errorMessage}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl tracking-tight mb-2">Saved Jobs</h1>
          <p className="text-muted-foreground">
            Jobs you&apos;ve bookmarked for later reference
          </p>
        </div>

        {/* Saved Jobs List */}
        {!savedJobs || savedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl mb-2">No saved jobs yet</h2>
              <p className="text-muted-foreground mb-4">
                Start saving jobs you&apos;re interested in to keep track of opportunities
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Browse Jobs
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {savedJobs.map((saved) => {
              const job = saved.jobs as any;
              if (!job) return null;

              return (
                <Card key={saved.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link href={`/jobs/${job.id}`}>
                          <CardTitle className="text-xl hover:text-primary cursor-pointer">
                            {job.title}
                          </CardTitle>
                        </Link>
                        <CardDescription className="mt-1">
                          {job.organization?.name && (
                            <Link
                              href={`/o/${job.organization.slug}`}
                              className="hover:underline"
                            >
                              {job.organization.name}
                            </Link>
                          )}
                        </CardDescription>
                      </div>
                      <SaveJobButton
                        jobId={job.id}
                        isSaved={true}
                        variant="ghost"
                        size="icon"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {/* Location */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {job.city ? `${job.city}, ` : ""}
                          {job.country}
                        </span>
                      </div>

                      {/* Role */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4 flex-shrink-0" />
                        <span>{job.role}</span>
                      </div>

                      {/* Season */}
                      {job.season_start && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {new Date(job.season_start).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                            {job.season_end &&
                              ` - ${new Date(job.season_end).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sports */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.sports?.map((sport: string) => (
                        <span
                          key={sport}
                          className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>

                    {/* Compensation */}
                    {job.pay && (
                      <div className="mt-4 text-sm font-medium">
                        {job.compensation === "salary" && `$${job.pay}/month`}
                        {job.compensation === "hourly" && `$${job.pay}/hour`}
                        {job.accommodation === "yes" && " + Accommodation"}
                      </div>
                    )}

                    {/* Saved date */}
                    <div className="mt-4 text-xs text-muted-foreground">
                      Saved on{" "}
                      {new Date(saved.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <AuthGuard>
      <SavedJobsContent />
    </AuthGuard>
  );
}
