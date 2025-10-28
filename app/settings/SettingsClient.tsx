"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useUpdateProfile } from "@/lib/mutations/useUpdateProfile";
import type { ProfileFormData } from "@/lib/validations/profile";
import type { UserWithProfile } from "@/lib/auth/session";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

interface SettingsClientProps {
  user: UserWithProfile;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateMutation = useUpdateProfile();

  // Pre-fill form with existing user data
  useEffect(() => {
    if (user.profile) {
      setFormData({
        display_name: user.profile.display_name || "",
        kind: user.profile.kind || "person",
        country: user.profile.country || "",
        bio: user.profile.bio || "",
        avatar_url: user.profile.avatar_url || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    try {
      await updateMutation.mutateAsync(formData as ProfileFormData);
      setSuccessMessage("Profile updated successfully!");

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update profile" });
    }
  };

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
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-ocean p-4 shadow-lg shadow-ocean-500/30">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-ocean bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Update your public profile information
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-border shadow-xl p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Avatar Upload */}
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={user.profile?.avatar_url || undefined}
                displayName={user.profile?.display_name || undefined}
                onUploadComplete={(url) => setFormData({ ...formData, avatar_url: url })}
              />

              <div className="border-t-2 border-ocean-100 pt-7" />

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name" className="text-sm font-bold text-ocean-900">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="Your name or organization name"
                  value={formData.display_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  required
                />
                {errors.display_name && (
                  <p className="text-xs text-destructive">{errors.display_name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This is how you&apos;ll appear to others on the platform
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-ocean-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="border-2 border-ocean-200 h-11 bg-sand-50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here
                </p>
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-ocean-900">
                  Account Type <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="person"
                      checked={formData.kind === "person"}
                      onChange={(e) =>
                        setFormData({ ...formData, kind: e.target.value as "person" | "org" })
                      }
                      className="w-5 h-5 text-ocean-500 focus:ring-2 focus:ring-ocean-200"
                    />
                    <span className="text-sm font-medium">Individual / Coach</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="kind"
                      value="org"
                      checked={formData.kind === "org"}
                      onChange={(e) =>
                        setFormData({ ...formData, kind: e.target.value as "person" | "org" })
                      }
                      className="w-5 h-5 text-ocean-500 focus:ring-2 focus:ring-ocean-200"
                    />
                    <span className="text-sm font-medium">Organization</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Are you an individual or representing an organization?
                </p>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-bold text-ocean-900">
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="e.g., Portugal"
                  value={formData.country || ""}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                />
                <p className="text-xs text-muted-foreground">Where are you based?</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-bold text-ocean-900">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your experience, or your organization..."
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 min-h-[150px] resize-y"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio?.length || 0} / 500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="border-t-2 border-ocean-100 pt-8 space-y-4">
                {successMessage && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                    <p className="text-sm font-medium text-green-700">{successMessage}</p>
                  </div>
                )}

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
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      Save Profile
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Your changes will be visible immediately
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
