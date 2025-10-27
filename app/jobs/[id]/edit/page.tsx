"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUpdateJob } from "@/lib/mutations/useUpdateJob";
import { useDeleteJob } from "@/lib/mutations/useDeleteJob";
import { createClient } from "@/lib/supabase/client";
import type { JobFormData } from "@/lib/validations/job";

const SPORTS_OPTIONS = [
  { value: "surf", label: "Surf" },
  { value: "windsurf", label: "Windsurf" },
  { value: "kitesurf", label: "Kitesurf" },
  { value: "sup", label: "SUP" },
  { value: "bodyboard", label: "Bodyboard" },
];

function EditJobForm() {
  const params = useParams();
  const jobId = params.id as string;

  const [formData, setFormData] = useState<Partial<JobFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateJob(jobId);
  const deleteMutation = useDeleteJob();

  // Load existing job data
  useEffect(() => {
    async function loadJob() {
      try {
        const supabase = createClient();
        const { data: job, error } = await supabase
          .from("jobs")
          .select("*, organization:organizations!inner(owner_profile_id)")
          .eq("id", jobId)
          .single();

        if (error || !job) {
          setLoadError("Job not found");
          return;
        }

        // Verify ownership
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadError("You must be logged in");
          return;
        }

        const organizationData = job.organization as unknown as { owner_profile_id: string };
        if (organizationData.owner_profile_id !== user.id) {
          setLoadError("You don't have permission to edit this job");
          return;
        }

        // Pre-fill form with existing data
        setFormData({
          title: job.title,
          role: job.role,
          sports: job.sports || ["surf"],
          description: job.description,
          city: job.city || undefined,
          country: job.country || "",
          season_start: job.season_start || undefined,
          season_end: job.season_end || undefined,
          compensation: job.compensation,
          pay: job.pay || undefined,
          accommodation: job.accommodation,
          contact: job.contact,
          contact_value: job.contact_value,
          photo_url: job.photo_url || undefined,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading job:", err);
        setLoadError("Failed to load job");
      }
    }

    loadJob();
  }, [jobId]);

  const toggleSport = (sportValue: string) => {
    const currentSports = formData.sports || [];
    if (currentSports.includes(sportValue)) {
      setFormData({
        ...formData,
        sports: currentSports.filter((s) => s !== sportValue),
      });
    } else {
      setFormData({
        ...formData,
        sports: [...currentSports, sportValue],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await updateMutation.mutateAsync(formData as JobFormData);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update job" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(jobId);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to delete job" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-ocean-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading job...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-cream-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-destructive">Error</h1>
            <p className="text-lg text-muted-foreground mb-8">{loadError}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-ocean bg-clip-text text-transparent">
              Edit Job
            </h1>
            <p className="text-lg text-muted-foreground">
              Update your job posting
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-border shadow-xl p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-ocean-900">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Surf Coach for Summer Season"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  required
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-bold text-ocean-900">
                  Role <span className="text-destructive">*</span>
                </Label>
                <select
                  id="role"
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full h-11 px-4 py-2 bg-white border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 transition-colors"
                  required
                >
                  <option value="">Select a role...</option>
                  <option value="coach">Coach</option>
                  <option value="media">Media / Content Creator</option>
                  <option value="camp_staff">Camp Staff</option>
                  <option value="ops">Operations / Management</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Sports */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-ocean-900">
                  Sports <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {SPORTS_OPTIONS.map((sport) => {
                    const isSelected = (formData.sports || []).includes(sport.value);
                    return (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => toggleSport(sport.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                          isSelected
                            ? "bg-gradient-ocean text-white shadow-lg shadow-ocean-500/30"
                            : "bg-cream-50 text-foreground border-2 border-border hover:border-ocean-300"
                        }`}
                      >
                        {sport.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-ocean-900">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, requirements, and what makes your camp unique..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 min-h-[200px] resize-y"
                  required
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-bold text-ocean-900">
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., Ericeira"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-bold text-ocean-900">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="e.g., Portugal"
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    required
                  />
                </div>
              </div>

              {/* Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="season_start" className="text-sm font-bold text-ocean-900">
                    Season Start
                  </Label>
                  <Input
                    id="season_start"
                    type="month"
                    value={formData.season_start || ""}
                    onChange={(e) => setFormData({ ...formData, season_start: e.target.value })}
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season_end" className="text-sm font-bold text-ocean-900">
                    Season End
                  </Label>
                  <Input
                    id="season_end"
                    type="month"
                    value={formData.season_end || ""}
                    onChange={(e) => setFormData({ ...formData, season_end: e.target.value })}
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-2">
                <Label htmlFor="compensation" className="text-sm font-bold text-ocean-900">
                  Compensation Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="compensation"
                  value={formData.compensation || ""}
                  onChange={(e) => setFormData({ ...formData, compensation: e.target.value as any })}
                  className="w-full h-11 px-4 py-2 bg-white border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 transition-colors"
                  required
                >
                  <option value="">Select compensation type...</option>
                  <option value="salary">Salary</option>
                  <option value="day_rate">Day Rate</option>
                  <option value="exchange">Exchange (accommodation for work)</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="unknown">To be discussed</option>
                </select>
              </div>

              {/* Pay Amount */}
              {formData.compensation && formData.compensation !== "volunteer" && (
                <div className="space-y-2">
                  <Label htmlFor="pay" className="text-sm font-bold text-ocean-900">
                    Pay Details
                  </Label>
                  <Input
                    id="pay"
                    type="text"
                    placeholder="e.g., €1,500/month or €50/day"
                    value={formData.pay || ""}
                    onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                </div>
              )}

              {/* Accommodation */}
              <div className="space-y-2">
                <Label htmlFor="accommodation" className="text-sm font-bold text-ocean-900">
                  Accommodation Provided <span className="text-destructive">*</span>
                </Label>
                <select
                  id="accommodation"
                  value={formData.accommodation || ""}
                  onChange={(e) => setFormData({ ...formData, accommodation: e.target.value as any })}
                  className="w-full h-11 px-4 py-2 bg-white border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 transition-colors"
                  required
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes - Full accommodation</option>
                  <option value="partial">Partial - Accommodation assistance</option>
                  <option value="no">No - Not provided</option>
                </select>
              </div>

              {/* Contact Method */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-bold text-ocean-900">
                  How should people apply? <span className="text-destructive">*</span>
                </Label>
                <select
                  id="contact"
                  value={formData.contact || ""}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value as any })}
                  className="w-full h-11 px-4 py-2 bg-white border-2 border-ocean-200 rounded-lg focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 transition-colors"
                  required
                >
                  <option value="">Select contact method...</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="link">Application Link</option>
                </select>
              </div>

              {/* Contact Value */}
              <div className="space-y-2">
                <Label htmlFor="contact_value" className="text-sm font-bold text-ocean-900">
                  {formData.contact === "email" && "Email Address"}
                  {formData.contact === "whatsapp" && "WhatsApp Number"}
                  {formData.contact === "link" && "Application URL"}
                  {!formData.contact && "Contact Information"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact_value"
                  type={formData.contact === "email" ? "email" : "text"}
                  placeholder={
                    formData.contact === "email"
                      ? "your@email.com"
                      : formData.contact === "whatsapp"
                      ? "+351 123 456 789"
                      : formData.contact === "link"
                      ? "https://..."
                      : "Contact information"
                  }
                  value={formData.contact_value || ""}
                  onChange={(e) => setFormData({ ...formData, contact_value: e.target.value })}
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  required
                />
              </div>

              {/* Submit and Delete Buttons */}
              <div className="border-t-2 border-ocean-100 pt-8 space-y-4">
                {errors.submit && (
                  <p className="text-sm text-destructive text-center">{errors.submit}</p>
                )}

                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full h-12 text-base font-bold shadow-xl hover:shadow-2xl"
                  size="lg"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Updating Job...
                    </>
                  ) : (
                    <>
                      Save Changes
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                {!showDeleteConfirm ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-12 text-base font-medium border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Job
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-destructive/5 border-2 border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive text-center">
                      Are you sure? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 bg-destructive hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Confirm Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <AuthGuard>
      <EditJobForm />
    </AuthGuard>
  );
}
