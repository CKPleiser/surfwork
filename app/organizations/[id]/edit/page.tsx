"use client";

/**
 * Organization Profile Edit Page
 * Comprehensive editor for organization profiles with media management
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  Image as ImageIcon,
  Video,
  Globe2,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { useOrganization } from "@/lib/hooks/useOrganization";
import { useUpdateOrganization } from "@/lib/mutations/useUpdateOrganization";
import { MediaUploadZone } from "@/components/organization/MediaUploadZone";
import { VideoUrlInput } from "@/components/organization/VideoUrlInput";
import type { OrganizationProfileFormData } from "@/lib/validations/organization";

interface OrganizationEditPageProps {
  params: { id: string };
}

function OrganizationEditForm({ params }: OrganizationEditPageProps) {
  const { user, isLoading: userLoading } = useUser();
  const { data: organization, isLoading: organizationLoading } = useOrganization(params.id);
  const updateMutation = useUpdateOrganization();

  const [formData, setFormData] = useState<Partial<OrganizationProfileFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Check authorization
  const isAuthorized = user && organization && organization.owner_profile_id === user.id;

  // Pre-fill form with existing organization data
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        about: organization.about || "",
        city: organization.city || "",
        country: organization.country || "",
        website: organization.website || "",
        email: organization.email || "",
        whatsapp: organization.whatsapp || "",
        instagram: organization.instagram || "",
        facebook: organization.facebook || "",
        youtube: organization.youtube || "",
        tiktok: organization.tiktok || "",
        hero_image_url: organization.hero_image_url || "",
        gallery_images: organization.gallery_images || [],
        video_urls: organization.video_urls || [],
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    try {
      await updateMutation.mutateAsync({
        organizationId: params.id,
        data: formData,
      });

      setSuccessMessage("Organization profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update organization profile" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Loading state
  if (userLoading || organizationLoading) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-ocean-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading organization profile...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h1 className="text-3xl font-bold mb-4 text-destructive">Access Denied</h1>
            <p className="text-lg text-muted-foreground mb-8">
              You don&apos;t have permission to edit this organization profile
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-ocean-600 hover:text-ocean-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-ocean p-4 shadow-lg shadow-ocean-500/30">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-ocean bg-clip-text text-transparent">
              Edit Organization Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your organization&apos;s public profile and media
            </p>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-2xl border-2 border-border shadow-xl p-8 sm:p-10">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-7 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700">{successMessage}</p>
              </div>
            )}

            {errors.submit && (
              <div className="mb-7 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Tab Navigation */}
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Basic Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="media" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Gallery</span>
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="gap-2">
                    <Video className="h-4 w-4" />
                    <span className="hidden sm:inline">Videos</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="gap-2">
                    <Globe2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Social Links</span>
                  </TabsTrigger>
                </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-7">
                <div>
                  <h3 className="text-lg font-bold text-ocean-900 mb-1">
                    Basic Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Essential details about your organization
                  </p>
                </div>

                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-ocean-900">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your official organization name
                  </p>
                </div>

                {/* About */}
                <div className="space-y-2">
                  <Label htmlFor="about" className="text-sm font-bold text-ocean-900">About Your Organization</Label>
                  <Textarea
                    id="about"
                    value={formData.about || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                    placeholder="Describe your organization, philosophy, facilities, and what makes you unique..."
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 min-h-[200px] resize-y"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.about?.length || 0} / 2000 characters — Tell coaches what makes your organization special
                  </p>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-bold text-ocean-900">City / Town</Label>
                    <Input
                      id="city"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="e.g., Ericeira"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-bold text-ocean-900">Country</Label>
                    <Input
                      id="country"
                      value={formData.country || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      placeholder="e.g., Portugal"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-ocean-900">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@yourorganization.com"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact email for inquiries
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-sm font-bold text-ocean-900">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="+351 912 345 678"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code
                    </p>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-bold text-ocean-900">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://yourorganization.com"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your official website URL
                  </p>
                </div>
              </TabsContent>

              {/* Media Gallery Tab */}
              <TabsContent value="media" className="space-y-7">
                <MediaUploadZone
                  organizationId={params.id}
                  type="gallery"
                  currentImages={formData.gallery_images || []}
                  maxImages={10}
                  onUploadComplete={(urls) =>
                    setFormData({ ...formData, gallery_images: urls })
                  }
                  label="Photo Gallery"
                  description="Upload images showcasing your organization, facilities, and team"
                />
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos" className="space-y-7">
                <VideoUrlInput
                  videoUrls={formData.video_urls || []}
                  maxVideos={5}
                  onUpdate={(urls) =>
                    setFormData({ ...formData, video_urls: urls })
                  }
                />
              </TabsContent>

              {/* Social Links Tab */}
              <TabsContent value="social" className="space-y-7">
                <div>
                  <h3 className="text-lg font-bold text-ocean-900 mb-1">
                    Social Media
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your social media profiles to increase visibility
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-sm font-bold text-ocean-900">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="@yourorganization"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-sm font-bold text-ocean-900">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, facebook: e.target.value })
                      }
                      placeholder="@yourorganization"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="text-sm font-bold text-ocean-900">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.youtube || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, youtube: e.target.value })
                      }
                      placeholder="@yourorganization"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="text-sm font-bold text-ocean-900">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={formData.tiktok || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, tiktok: e.target.value })
                      }
                      placeholder="@yourorganization"
                      className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit Button */}
            <div className="border-t-2 border-ocean-100 pt-8 mt-8 space-y-4">
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
                    <Save className="h-5 w-5 mr-2" />
                    Save Organization Profile
                  </>
                )}
              </Button>

              <Link href={`/o/${organization?.slug || params.id}`} className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2"
                  size="lg"
                >
                  Preview Profile
                </Button>
              </Link>

              <p className="text-center text-sm text-muted-foreground">
                Changes will be visible immediately on your profile
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationEditPage({ params }: OrganizationEditPageProps) {
  return (
    <AuthGuard>
      <OrganizationEditForm params={params} />
    </AuthGuard>
  );
}
