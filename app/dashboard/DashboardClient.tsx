/**
 * Dashboard Client Component
 * Handles all client-side interactivity for the dashboard
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserJobs } from "@/lib/queries/useUserJobs";
import { useUserOrganization } from "@/lib/hooks/useOrganization";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  User,
  FileText,
  Heart,
  Plus,
  Loader2,
  Building2,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DashboardJobCardSkeleton } from "@/components/skeletons/DashboardJobCardSkeleton";
import type { UserWithProfile } from "@/lib/auth/session";

interface DashboardClientProps {
  user: UserWithProfile;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const { data: userJobs, isLoading: jobsLoading } = useUserJobs();
  const { data: userOrganization, isLoading: organizationLoading } = useUserOrganization(user?.id);
  const [activeTab, setActiveTab] = useState("jobs");
  const [creatingOrganization, setCreatingOrganization] = useState(false);

  // Check if user is an organization (kind is 'org' not 'organization')
  const isOrganization = user.profile?.kind === "org";

  const handleCreateOrganization = async () => {
    setCreatingOrganization(true);
    try {
      // Dynamic import to keep Supabase out of commons chunk
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Generate slug from organization name
      const orgName = user.profile?.display_name || "My Organization";
      const baseSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Add timestamp to ensure uniqueness
      const slug = `${baseSlug}-${Date.now()}`;

      // Create a basic organization profile
      const { data: newOrg, error } = await supabase
        .from("organizations")
        .insert({
          name: orgName,
          slug: slug,
          country: user.profile?.country || "",
          owner_profile_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to edit page
      router.push(`/organizations/${newOrg.id}/edit`);
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("Failed to create organization profile. Please try again.");
    } finally {
      setCreatingOrganization(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-ocean bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Manage your jobs, profile, and support the community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="p-4 bg-white border-2 border-border">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      activeTab === "jobs"
                        ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                        : "hover:bg-cream-50 text-foreground"
                    }`}
                  >
                    <Briefcase className="h-5 w-5" />
                    <span>My Jobs</span>
                  </button>
                  {isOrganization && (
                    <button
                      onClick={() => setActiveTab("organization")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                        activeTab === "organization"
                          ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                          : "hover:bg-cream-50 text-foreground"
                      }`}
                    >
                      <Building2 className="h-5 w-5" />
                      <span>Organization Profile</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      activeTab === "profile"
                        ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                        : "hover:bg-cream-50 text-foreground"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      activeTab === "applications"
                        ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                        : "hover:bg-cream-50 text-foreground"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Applications</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("support")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      activeTab === "support"
                        ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                        : "hover:bg-cream-50 text-foreground"
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Support</span>
                  </button>
                </nav>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {activeTab === "jobs" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">My Posted Jobs</h2>
                    <Link href="/jobs/new">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Job
                      </Button>
                    </Link>
                  </div>

                  {jobsLoading ? (
                    <div className="space-y-4">
                      <DashboardJobCardSkeleton />
                      <DashboardJobCardSkeleton />
                      <DashboardJobCardSkeleton />
                    </div>
                  ) : userJobs && userJobs.length > 0 ? (
                    <div className="space-y-4">
                      {userJobs.map((job) => (
                        <Card key={job.id} className="p-6 bg-white border-2 border-border hover:border-ocean-400 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                                <Badge
                                  variant={
                                    job.status === "active"
                                      ? "default"
                                      : job.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {job.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="font-medium">{job.role}</span>
                                <span>•</span>
                                <span>{[job.city, job.country].filter(Boolean).join(", ")}</span>
                                <span>•</span>
                                <span>Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/jobs/${job.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/jobs/${job.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12 text-center bg-white border-2 border-border">
                      <div className="text-6xl mb-4">🏄</div>
                      <h3 className="text-2xl font-bold mb-2">You haven&apos;t posted any jobs yet</h3>
                      <p className="text-muted-foreground mb-6 text-lg">
                        Start by posting your first surf job to the community
                      </p>
                      <Link href="/jobs/new">
                        <Button size="lg">Post a Job</Button>
                      </Link>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "organization" && isOrganization && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                      Organization Profile
                    </h2>
                    {userOrganization && (
                      <div className="flex gap-2">
                        <Link href={`/organizations/${userOrganization.id}/edit`}>
                          <Button className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        </Link>
                        {userOrganization.slug && (
                          <Link href={`/o/${userOrganization.slug}`} target="_blank">
                            <Button variant="outline" className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              View Public
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {organizationLoading ? (
                    <Card className="p-8 bg-white border-2 border-border">
                      <div className="space-y-6 animate-pulse">
                        <div className="space-y-2">
                          <div className="h-7 w-48 bg-muted rounded" />
                          <div className="h-4 w-32 bg-muted rounded" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="h-12 w-12 bg-muted rounded-lg mb-2" />
                            <div className="h-4 w-24 bg-muted rounded" />
                          </div>
                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="h-12 w-12 bg-muted rounded-lg mb-2" />
                            <div className="h-4 w-24 bg-muted rounded" />
                          </div>
                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="h-12 w-12 bg-muted rounded-lg mb-2" />
                            <div className="h-4 w-24 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : userOrganization ? (
                    <Card className="p-8 bg-white border-2 border-border">
                      <div className="space-y-6">
                        {/* School Header */}
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-2">{userOrganization.name}</h3>
                          {userOrganization.city && userOrganization.country && (
                            <p className="text-muted-foreground">
                              {userOrganization.city}, {userOrganization.country}
                            </p>
                          )}
                        </div>

                        {/* Profile Completion Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  userOrganization.about ? "bg-green-100" : "bg-gray-100"
                                }`}
                              >
                                <FileText
                                  className={`h-5 w-5 ${
                                    userOrganization.about ? "text-green-600" : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">About Section</p>
                                <p className="text-xs text-muted-foreground">
                                  {userOrganization.about ? "Completed" : "Not set"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  (userOrganization.gallery_images?.length ?? 0) > 0 ? "bg-green-100" : "bg-gray-100"
                                }`}
                              >
                                <ImageIcon
                                  className={`h-5 w-5 ${
                                    (userOrganization.gallery_images?.length ?? 0) > 0
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Photo Gallery</p>
                                <p className="text-xs text-muted-foreground">
                                  {userOrganization.gallery_images?.length || 0} photos
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  (userOrganization.video_urls?.length ?? 0) > 0 ? "bg-green-100" : "bg-gray-100"
                                }`}
                              >
                                <Video
                                  className={`h-5 w-5 ${
                                    (userOrganization.video_urls?.length ?? 0) > 0
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">Videos</p>
                                <p className="text-xs text-muted-foreground">
                                  {userOrganization.video_urls?.length || 0} videos
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-6 border-t-2 border-border">
                          <p className="text-sm font-medium text-foreground mb-4">Quick Actions</p>
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/organizations/${userOrganization.id}/edit`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                              </Button>
                            </Link>
                            {!userOrganization.about && (
                              <Link href={`/organizations/${userOrganization.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Add About Section
                                </Button>
                              </Link>
                            )}
                            {(!userOrganization.gallery_images || userOrganization.gallery_images.length === 0) && (
                              <Link href={`/organizations/${userOrganization.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Upload Photos
                                </Button>
                              </Link>
                            )}
                            {(!userOrganization.video_urls || userOrganization.video_urls.length === 0) && (
                              <Link href={`/organizations/${userOrganization.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Add Videos
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-12 text-center bg-white border-2 border-border">
                      <div className="text-6xl mb-4">🏫</div>
                      <h3 className="text-2xl font-bold mb-2">Create Your Organization Profile</h3>
                      <p className="text-muted-foreground mb-6 text-lg">
                        Set up your organization profile to start posting jobs and building your team
                      </p>
                      <Button
                        size="lg"
                        className="gap-2"
                        onClick={handleCreateOrganization}
                        disabled={creatingOrganization}
                      >
                        {creatingOrganization ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Building2 className="h-5 w-5" />
                            Create Organization Profile
                          </>
                        )}
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">My Profile</h2>
                    <Link href="/settings">
                      <Button className="gap-2">
                        <User className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>

                  <Card className="p-8 bg-white border-2 border-border">
                    <div className="space-y-6">
                      <div className="flex items-start gap-6">
                        {user.profile?.avatar_url ? (
                          <img
                            src={user.profile.avatar_url}
                            alt={user.profile.display_name || "User"}
                            className="w-24 h-24 rounded-full object-cover border-2 border-ocean-400"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-ocean flex items-center justify-center text-4xl text-white shadow-lg shadow-ocean-500/30">
                            {user.profile?.display_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-2xl font-bold text-foreground mb-1">
                              {user.profile?.display_name || "No name set"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {user.profile?.kind === "person" ? "Individual" : "Organization"} • {user.profile?.country || "Location not set"}
                            </p>
                          </div>
                          {user.profile?.bio && (
                            <p className="text-base text-foreground leading-relaxed">
                              {user.profile.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {!user.profile?.bio && (
                        <div className="pt-6 border-t-2 border-border">
                          <p className="text-sm text-muted-foreground text-center">
                            Complete your profile to let camps and employers know more about you
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "applications" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">My Applications</h2>
                  <Card className="p-12 text-center bg-white border-2 border-border">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-2xl font-bold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      When you apply to jobs, you&apos;ll see them tracked here
                    </p>
                    <Link href="/">
                      <Button size="lg">Browse Jobs</Button>
                    </Link>
                  </Card>
                </div>
              )}

              {activeTab === "support" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">Support Surf Work</h2>
                  <Card className="p-8 bg-white border-2 border-border">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-ocean flex items-center justify-center flex-shrink-0 shadow-lg shadow-ocean-500/20">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2 text-foreground">Keep Surf Work free</h3>
                          <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                            Surf Work is built by the community, for the community. We don&apos;t charge
                            job posters or job seekers. If you find value in what we&apos;re doing,
                            consider supporting us with a small donation.
                          </p>
                          <p className="text-sm font-semibold text-foreground mb-4">
                            Your support helps us:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                            <li>&bull; Keep the platform free and accessible</li>
                            <li>&bull; Cover hosting and maintenance costs</li>
                            <li>&bull; Add new features based on community feedback</li>
                            <li>&bull; Support the global surf work community</li>
                          </ul>
                          <Button size="lg" className="gap-2">
                            <Heart className="h-5 w-5" />
                            Donate via Ko-fi
                          </Button>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-border">
                        <p className="text-sm text-muted-foreground">
                          Every supporter gets a shoutout in our footer. This week: Maria from Ericeira 🌊
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
