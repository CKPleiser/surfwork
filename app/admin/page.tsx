import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Briefcase, ExternalLink } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function approveJob(formData: FormData) {
  "use server";

  const jobId = formData.get("jobId") as string;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return;

  // Update job status
  await supabase
    .from("jobs")
    .update({
      status: "active",
    })
    .eq("id", jobId);

  revalidatePath("/admin");
  revalidatePath("/jobs");
}

async function rejectJob(formData: FormData) {
  "use server";

  const jobId = formData.get("jobId") as string;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return;

  // Update job status
  await supabase
    .from("jobs")
    .update({
      status: "rejected",
    })
    .eq("id", jobId);

  revalidatePath("/admin");
  revalidatePath("/jobs");
}

async function AdminContent() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  // Fetch pending jobs
  const { data: pendingJobs } = await supabase
    .from("jobs")
    .select(`
      id,
      created_at,
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
      description,
      status,
      organization:organizations (
        name,
        slug,
        owner_profile_id,
        profiles (
          display_name,
          email
        )
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Fetch recently moderated jobs
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select(`
      id,
      created_at,
      updated_at,
      title,
      status,
      organization:organizations (
        name
      )
    `)
    .in("status", ["active", "rejected"])
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Moderate job postings and manage platform content
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Review</CardTitle>
              <CardDescription>Jobs waiting for moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingJobs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recently Approved</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentJobs?.filter((j) => j.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recently Rejected</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {recentJobs?.filter((j) => j.status === "rejected").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Jobs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Jobs</h2>
          {!pendingJobs || pendingJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No jobs pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingJobs.map((job) => {
                const organization = job.organization as any;
                const orgOwner = organization?.profiles as any;

                return (
                  <Card key={job.id} className="border-yellow-500/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {organization?.name} • Posted by {orgOwner?.display_name} (
                            {orgOwner?.email})
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Job Details */}
                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {job.city ? `${job.city}, ` : ""}
                            {job.country}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="h-4 w-4 flex-shrink-0" />
                          <span>{job.role}</span>
                        </div>

                        {job.season_start && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {new Date(job.season_start).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description preview */}
                      <div className="mb-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm line-clamp-3">{job.description}</p>
                      </div>

                      {/* Sports */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.sports?.map((sport: string) => (
                          <span
                            key={sport}
                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                          >
                            {sport}
                          </span>
                        ))}
                      </div>

                      {/* Posted date */}
                      <div className="text-xs text-muted-foreground mb-4">
                        Posted on{" "}
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link href={`/jobs/${job.id}/preview`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                        </Link>
                        <form action={approveJob}>
                          <input type="hidden" name="jobId" value={job.id} />
                          <Button type="submit" variant="default" size="sm">
                            Approve
                          </Button>
                        </form>
                        <form action={rejectJob}>
                          <input type="hidden" name="jobId" value={job.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            Reject
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          {!recentJobs || recentJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No recent moderation activity</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {(job.organization as any)?.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={job.status === "active" ? "default" : "destructive"}
                        >
                          {job.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(job.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  // AdminContent already has server-side auth checks internally
  return <AdminContent />;
}
