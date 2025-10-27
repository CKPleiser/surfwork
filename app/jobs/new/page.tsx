"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Check, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/AuthGuard";
import { createJob } from "./actions";
import type { JobFormData } from "@/lib/validations/job";

const SPORTS_OPTIONS = [
  { value: "surf", label: "Surf" },
  { value: "kite", label: "Kite" },
  { value: "wing", label: "Wing" },
  { value: "sup", label: "SUP" },
  { value: "windsurf", label: "Windsurf" },
  { value: "bodyboard", label: "Bodyboard" },
];

function PostJobContent() {
  const [formData, setFormData] = useState<Partial<JobFormData>>({
    sports: ["surf"],
    accommodation: "no",
    compensation: "salary",
    contact: "email",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSportToggle = (sport: string) => {
    const currentSports = formData.sports || [];
    const newSports = currentSports.includes(sport)
      ? currentSports.filter((s) => s !== sport)
      : [...currentSports, sport];
    setFormData({ ...formData, sports: newSports });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError(null);

    try {
      const result = await createJob(formData as JobFormData);
      if (result?.error) {
        setSubmitError(result.error);
        // Handle field-specific errors from server validation
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
      } else {
        setSubmitted(true);
      }
    } catch (error: any) {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen py-16 bg-gradient-to-b from-cream-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-ocean-200 shadow-2xl p-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-ocean p-4 shadow-lg shadow-ocean-500/30">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-ocean bg-clip-text text-transparent">Job posted successfully!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your job will go live within 24 hours. We&apos;ll review it to make sure everything looks good.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg">Browse Jobs</Button>
              </Link>
              <Link href="/jobs/new">
                <Button size="lg" variant="outline">
                  Post Another Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ocean-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>

        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-ocean p-4 shadow-lg shadow-ocean-500/30">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-ocean bg-clip-text text-transparent">Post a Job</h1>
            <p className="text-lg text-muted-foreground">
              Find your next surf coach or team member
            </p>
          </div>

          {/* Form Card */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  required
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Make it specific and clear — this is the first thing coaches see
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-bold text-ocean-900">
                  Role Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="role"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as any })
                  }
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
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Choose the category that best fits this position
                </p>
              </div>

              {/* Sports */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-ocean-900">
                  Sports <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS_OPTIONS.map((sport) => (
                    <Badge
                      key={sport.value}
                      variant={
                        formData.sports?.includes(sport.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => handleSportToggle(sport.value)}
                    >
                      {sport.label}
                    </Badge>
                  ))}
                </div>
                {errors.sports && (
                  <p className="text-xs text-destructive">{errors.sports}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Select all sports this role involves
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-ocean-900">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what makes your camp special..."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 min-h-[200px]"
                  rows={8}
                  required
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description?.length || 0} / 50 characters minimum — be clear about what you&apos;re looking for
                </p>
              </div>

              {/* Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City / Town</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g., Ericeira"
                    value={formData.city || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="e.g., Portugal"
                    value={formData.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country}</p>
                  )}
                </div>
              </div>

              {/* Season Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="season_start">Season Start</Label>
                  <Input
                    id="season_start"
                    type="date"
                    value={formData.season_start || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, season_start: e.target.value })
                    }
                  />
                  {errors.season_start && (
                    <p className="text-xs text-destructive">{errors.season_start}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season_end">Season End</Label>
                  <Input
                    id="season_end"
                    type="date"
                    value={formData.season_end || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, season_end: e.target.value })
                    }
                  />
                  {errors.season_end && (
                    <p className="text-xs text-destructive">{errors.season_end}</p>
                  )}
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-2">
                <Label htmlFor="compensation">
                  Compensation Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="compensation"
                  value={formData.compensation || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      compensation: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="salary">Salary</option>
                  <option value="day_rate">Day Rate</option>
                  <option value="exchange">Exchange / Work Trade</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="unknown">To Be Discussed</option>
                </select>
                {errors.compensation && (
                  <p className="text-xs text-destructive">{errors.compensation}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  How will the coach be compensated?
                </p>
              </div>

              {/* Pay Amount */}
              <div className="space-y-2">
                <Label htmlFor="pay">
                  Pay Amount {formData.compensation !== "volunteer" && "(Optional)"}
                </Label>
                <Input
                  id="pay"
                  type="text"
                  placeholder="e.g., €1800/mo or €100/day"
                  value={formData.pay || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pay: e.target.value })
                  }
                />
                {errors.pay && (
                  <p className="text-xs text-destructive">{errors.pay}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Coaches appreciate transparency — share what you can offer
                </p>
              </div>

              {/* Accommodation */}
              <div className="space-y-2">
                <Label>
                  Accommodation <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "yes", label: "Included" },
                    { value: "partial", label: "Partial / Discounted" },
                    { value: "no", label: "Not Included" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <input
                        type="radio"
                        name="accommodation"
                        value={option.value}
                        checked={formData.accommodation === option.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accommodation: e.target.value as any,
                          })
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.accommodation && (
                  <p className="text-xs text-destructive">{errors.accommodation}</p>
                )}
              </div>

              {/* Contact Method */}
              <div className="space-y-2">
                <Label>
                  Contact Method <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {[
                    { value: "email", label: "Email" },
                    { value: "whatsapp", label: "WhatsApp" },
                    { value: "link", label: "Application Link" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <input
                        type="radio"
                        name="contact"
                        value={option.value}
                        checked={formData.contact === option.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact: e.target.value as any,
                          })
                        }
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.contact && (
                  <p className="text-xs text-destructive">{errors.contact}</p>
                )}
              </div>

              {/* Contact Value */}
              <div className="space-y-2">
                <Label htmlFor="contact_value">
                  {formData.contact === "email" && "Email Address"}
                  {formData.contact === "whatsapp" && "WhatsApp Number"}
                  {formData.contact === "link" && "Application URL"}
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="contact_value"
                  type={formData.contact === "email" ? "email" : "text"}
                  placeholder={
                    formData.contact === "email"
                      ? "jobs@surfcamp.com"
                      : formData.contact === "whatsapp"
                      ? "+351 912 345 678"
                      : "https://apply.surfcamp.com"
                  }
                  value={formData.contact_value || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_value: e.target.value })
                  }
                  required
                />
                {errors.contact_value && (
                  <p className="text-xs text-destructive">{errors.contact_value}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.contact === "email" &&
                    "Coaches will send applications directly to this email"}
                  {formData.contact === "whatsapp" &&
                    "Include country code, e.g., +351 912345678"}
                  {formData.contact === "link" &&
                    "Full URL to your application form or booking page"}
                </p>
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <Label htmlFor="photo_url">Photo URL (Optional)</Label>
                <Input
                  id="photo_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.photo_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, photo_url: e.target.value })
                  }
                />
                {errors.photo_url && (
                  <p className="text-xs text-destructive">{errors.photo_url}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Add a photo of your camp, beach, or team
                </p>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <div className="border-t-2 border-ocean-100 pt-8 space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-bold shadow-xl hover:shadow-2xl"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Posting Job...
                    </>
                  ) : (
                    <>
                      Post This Job
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Your listing will be live within 24 hours ✓
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-10 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              All job posts are moderated to keep the board spam-free and authentic
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <AuthGuard>
      <PostJobContent />
    </AuthGuard>
  );
}
