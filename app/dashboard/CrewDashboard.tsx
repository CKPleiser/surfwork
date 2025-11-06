/**
 * Crew Dashboard Component
 * Dashboard view specifically for crew members (profile.kind === "person")
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  User,
  FileText,
  Heart,
  Edit,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import type { UserWithProfile } from "@/lib/auth/session";
import { MyApplicationsList } from "@/components/applications/my-applications-list";

interface CrewDashboardProps {
  user: UserWithProfile;
}

export function CrewDashboard({ user }: CrewDashboardProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-ocean bg-clip-text text-transparent">
              Crew Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your profile, find opportunities, and connect with surf organizations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="p-4 bg-white border-2 border-border">
                <nav className="space-y-2">
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
                    onClick={() => setActiveTab("saved")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                      activeTab === "saved"
                        ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/20"
                        : "hover:bg-cream-50 text-foreground"
                    }`}
                  >
                    <Bookmark className="h-5 w-5" />
                    <span>Saved Jobs</span>
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
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                      My Crew Profile
                    </h2>
                    <div className="flex gap-2">
                      <Link href="/crew/profile/edit">
                        <Button className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                      {user.profile?.slug && (
                        <Link href={`/crew/${user.profile.slug}`} target="_blank">
                          <Button variant="outline" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            View Public
                          </Button>
                        </Link>
                      )}
                    </div>
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
                              {user.profile?.display_name || user.profile?.first_name || "No name set"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Crew Member • {user.profile?.country || "Location not set"}
                            </p>
                          </div>
                          {user.profile?.bio && (
                            <p className="text-base text-foreground leading-relaxed">
                              {user.profile.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Profile Completion Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                user.profile?.avatar_url ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              <User
                                className={`h-5 w-5 ${
                                  user.profile?.avatar_url ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Photo</p>
                              <p className="text-xs text-muted-foreground">
                                {user.profile?.avatar_url ? "Uploaded" : "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                user.profile?.bio ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  user.profile?.bio ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Bio</p>
                              <p className="text-xs text-muted-foreground">
                                {user.profile?.bio ? "Completed" : "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                user.profile?.skills && user.profile.skills.length > 0 ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              <Briefcase
                                className={`h-5 w-5 ${
                                  user.profile?.skills && user.profile.skills.length > 0
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Skills</p>
                              <p className="text-xs text-muted-foreground">
                                {user.profile?.skills?.length || 0} added
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-cream-50 rounded-lg border-2 border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                user.profile?.about ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              <FileText
                                className={`h-5 w-5 ${
                                  user.profile?.about ? "text-green-600" : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">About</p>
                              <p className="text-xs text-muted-foreground">
                                {user.profile?.about ? "Completed" : "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-6 border-t-2 border-border">
                        <p className="text-sm font-medium text-foreground mb-4">Quick Actions</p>
                        <div className="flex flex-wrap gap-3">
                          <Link href="/crew/profile/edit">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Profile
                            </Button>
                          </Link>
                          {!user.profile?.avatar_url && (
                            <Link href="/crew/profile/edit">
                              <Button variant="outline" size="sm">
                                Upload Photo
                              </Button>
                            </Link>
                          )}
                          {!user.profile?.bio && (
                            <Link href="/crew/profile/edit">
                              <Button variant="outline" size="sm">
                                Add Bio
                              </Button>
                            </Link>
                          )}
                          {(!user.profile?.skills || user.profile.skills.length === 0) && (
                            <Link href="/crew/profile/edit">
                              <Button variant="outline" size="sm">
                                Add Skills
                              </Button>
                            </Link>
                          )}
                          {!user.profile?.about && (
                            <Link href="/crew/profile/edit">
                              <Button variant="outline" size="sm">
                                Add About Section
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                      Saved Jobs
                    </h2>
                    <Link href="/jobs">
                      <Button className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>

                  <Card className="p-12 text-center bg-white border-2 border-border">
                    <div className="text-6xl mb-4">🔖</div>
                    <h3 className="text-2xl font-bold mb-2">No saved jobs yet</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Save jobs you&apos;re interested in to easily find them later
                    </p>
                    <Link href="/jobs">
                      <Button size="lg">Browse Available Jobs</Button>
                    </Link>
                  </Card>
                </div>
              )}

              {activeTab === "applications" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                    My Applications
                  </h2>
                  <MyApplicationsList />
                </div>
              )}

              {activeTab === "support" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
                    Support Surf Work
                  </h2>
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
