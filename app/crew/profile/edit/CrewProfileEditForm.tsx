/**
 * Crew Profile Edit Form - Client Component
 * Multi-section form for editing crew member profiles
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, User, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { FileUploadButton } from "@/components/forms/FileUploadButton";
import { crewProfileEditSchema, type CrewProfileEditFormData } from "./schema";
import { updateCrewProfile, uploadAvatarForProfile } from "./actions";
import { errorTracker } from "@/lib/utils/error-tracking";
import type { Profile } from "@/lib/supabase/types";

interface CrewProfileEditFormProps {
  profile: Profile;
}

export function CrewProfileEditForm({ profile }: CrewProfileEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ submit?: string }>({});
  const [activeTab, setActiveTab] = useState("personal");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);

  // Initialize form with profile data
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
    setValue,
  } = useForm<CrewProfileEditFormData>({
    resolver: zodResolver(crewProfileEditSchema),
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      country: profile.country || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || "",
      is_public: profile.is_public ?? true,
      roles: [], // Will need to parse from profile data
      skills: profile.skills || [],
      links: {
        instagram: ((profile.links as any)?.instagram as string) || "",
        portfolio: ((profile.links as any)?.portfolio as string) || "",
        site: ((profile.links as any)?.site as string) || "",
        whatsapp: ((profile.links as any)?.whatsapp as string) || "",
      },
      about: profile.about || "",
      availability_start: "",
      availability_end: "",
      preferred_regions: [],
      open_to: [],
      pitch_title: "",
      pitch_description: "",
      contact_method: "email",
      contact_value: profile.email || "",
    },
  });

  const onSubmit = async (data: CrewProfileEditFormData) => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Upload avatar if a new file was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const uploadResult = await uploadAvatarForProfile(formData, profile.id);
        if (uploadResult.error) {
          setErrors({ submit: `Avatar upload failed: ${uploadResult.error}` });
          window.scrollTo({ top: 0, behavior: "smooth" });
          setIsSubmitting(false);
          return;
        }
        // Update form data with uploaded avatar URL
        data.avatar_url = uploadResult.url || "";
      }

      const result = await updateCrewProfile(profile.id, data);

      if (result.error) {
        setErrors({ submit: result.error });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Success - redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      errorTracker.logError("Profile edit submission error", { error, profileId: profile.id });
      setErrors({ submit: "An unexpected error occurred. Please try again." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Global Error Message */}
      {errors.submit && (
        <Card className="p-4 bg-red-50 border-2 border-red-200">
          <p className="text-sm font-medium text-red-800">{errors.submit}</p>
        </Card>
      )}

      {/* Tab Navigation and Content */}
      <Card className="p-8 bg-white border-2 border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Work & Skills</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-900 mb-1">
                Personal Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Basic details about you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-bold text-ocean-900">
                  First Name *
                </Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  className="border-2"
                  placeholder="John"
                />
                {formErrors.first_name && (
                  <p className="text-sm text-red-600">{formErrors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-bold text-ocean-900">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  className="border-2"
                  placeholder="Doe"
                />
                {formErrors.last_name && (
                  <p className="text-sm text-red-600">{formErrors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-bold text-ocean-900">
                Country
              </Label>
              <Input
                id="country"
                {...register("country")}
                className="border-2"
                placeholder="Portugal"
              />
              {formErrors.country && (
                <p className="text-sm text-red-600">{formErrors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-bold text-ocean-900">
                Short Bio
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                className="border-2 min-h-[100px]"
                placeholder="Tell us a little about yourself..."
              />
              <p className="text-xs text-muted-foreground">Max 600 characters</p>
              {formErrors.bio && (
                <p className="text-sm text-red-600">{formErrors.bio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-ocean-900">
                Profile Photo
              </Label>
              <FileUploadButton
                variant="avatar"
                maxSizeMB={2}
                onFileSelect={(file, previewUrl) => {
                  setAvatarFile(file);
                  setAvatarPreview(previewUrl);
                }}
                onFileRemove={() => {
                  setAvatarFile(null);
                  setAvatarPreview(profile.avatar_url || null);
                }}
                previewUrl={avatarPreview}
                label="Upload a profile photo (max 2MB)"
              />
              {formErrors.avatar_url && (
                <p className="text-sm text-red-600">{formErrors.avatar_url.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={watch("is_public")}
                onCheckedChange={(checked) => setValue("is_public", checked as boolean)}
              />
              <Label htmlFor="is_public" className="text-sm font-medium cursor-pointer">
                Make my profile public (visible to organizations)
              </Label>
            </div>
          </TabsContent>

          {/* Skills & Links Tab */}
          <TabsContent value="work" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-900 mb-1">
                Skills & Social Links
              </h3>
              <p className="text-sm text-muted-foreground">
                Showcase your skills and connect your social profiles
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills" className="text-sm font-bold text-ocean-900">
                Skills
              </Label>
              <Textarea
                id="skills"
                value={watch("skills")?.join(", ") || ""}
                onChange={(e) => {
                  const skillsArray = e.target.value
                    .split(/[,\s]+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                  setValue("skills", skillsArray);
                }}
                className="border-2 min-h-[100px]"
                placeholder="surfing, photography, videography, coaching, first aid"
              />
              <p className="text-xs text-muted-foreground">
                Add your skills separated by commas or spaces (e.g., surfing, photography videography)
              </p>
              {formErrors.skills && (
                <p className="text-sm text-red-600">{formErrors.skills.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold text-ocean-900">Social Links</Label>

              <div className="space-y-2">
                <Label htmlFor="links.instagram" className="text-sm font-medium text-ocean-700">
                  Instagram
                </Label>
                <Input
                  id="links.instagram"
                  {...register("links.instagram")}
                  className="border-2"
                  placeholder="@yourusername"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="links.portfolio" className="text-sm font-medium text-ocean-700">
                  Portfolio
                </Label>
                <Input
                  id="links.portfolio"
                  {...register("links.portfolio")}
                  className="border-2"
                  placeholder="https://yourportfolio.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="links.site" className="text-sm font-medium text-ocean-700">
                  Website
                </Label>
                <Input
                  id="links.site"
                  {...register("links.site")}
                  className="border-2"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="links.whatsapp" className="text-sm font-medium text-ocean-700">
                  WhatsApp
                </Label>
                <Input
                  id="links.whatsapp"
                  {...register("links.whatsapp")}
                  className="border-2"
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ocean-900 mb-1">
                About Your Work
              </h3>
              <p className="text-sm text-muted-foreground">
                Tell organizations about your experience and what you&apos;re looking for
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about" className="text-sm font-bold text-ocean-900">
                About
              </Label>
              <Textarea
                id="about"
                {...register("about")}
                className="border-2 min-h-[200px]"
                placeholder="Describe your experience, specialties, and what you're passionate about..."
              />
              <p className="text-xs text-muted-foreground">
                {watch("about")?.length || 0} / 1500 characters
              </p>
              {formErrors.about && (
                <p className="text-sm text-red-600">{formErrors.about.message}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t-2 border-border">
        <Link href="/dashboard">
          <Button type="button" variant="outline" className="gap-2 w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 w-full sm:w-auto min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
