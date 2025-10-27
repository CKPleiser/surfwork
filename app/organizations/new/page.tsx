"use client";

/**
 * Organization Onboarding Wizard
 * Multi-step wizard for creating a new organization profile
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  Loader2,
  MapPin,
  Globe2,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from "@/lib/supabase/client";

interface OrganizationFormData {
  name: string;
  about: string;
  city: string;
  country: string;
  website: string;
  email: string;
  whatsapp: string;
}

function OrganizationOnboardingWizard() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    about: "",
    city: "",
    country: "",
    website: "",
    email: "",
    whatsapp: "",
  });

  // Check authorization - only org accounts can create organizations
  if (!userLoading && user && user.kind !== "org") {
    router.push("/dashboard");
    return null;
  }

  // Loading state
  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-ocean-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    // Simple validation before advancing
    if (step === 1 && !formData.name.trim()) {
      setErrors({ name: "Organization name is required" });
      return;
    }
    if (step === 2 && !formData.country.trim()) {
      setErrors({ country: "Country is required" });
      return;
    }
    setErrors({});
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();

      // Create organization
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .insert({
          name: formData.name,
          about: formData.about || null,
          city: formData.city || null,
          country: formData.country,
          website: formData.website || null,
          email: formData.email || null,
          whatsapp: formData.whatsapp || null,
          owner_profile_id: user.id,
        })
        .select()
        .single();

      if (organizationError) throw organizationError;

      // Redirect to organization edit page
      router.push(`/organizations/${organization.id}/edit`);
      router.refresh();
    } catch (error: any) {
      console.error("Organization creation error:", error);
      setErrors({ submit: error.message || "Failed to create organization profile" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-16 rounded-full transition-all ${
                    step >= index + 1 ? "bg-gradient-ocean" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Step {step} of {totalSteps}
            </p>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-ocean p-4 shadow-lg shadow-ocean-500/30">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-ocean bg-clip-text text-transparent">
              {step === 1 && "Create Your Organization Profile"}
              {step === 2 && "Where Are You Located?"}
              {step === 3 && "Contact Information"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {step === 1 && "Let's start with the basics about your organization"}
              {step === 2 && "Help coaches find you by adding your location"}
              {step === 3 && "Make it easy for coaches to get in touch"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border-2 border-border shadow-xl p-8 sm:p-10">
            {/* Error Message */}
            {errors.submit && (
              <div className="mb-7 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-7">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-ocean-900">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Ericeira Surf Academy"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your official organization name
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="about" className="text-sm font-bold text-ocean-900">
                    About Your Organization
                  </Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="Describe your organization, philosophy, facilities, and what makes you unique..."
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 min-h-[150px] resize-y"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.about.length} / 2000 characters — You can edit this later
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-7">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center rounded-full bg-ocean-50 p-3 mb-4">
                    <MapPin className="h-6 w-6 text-ocean-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-bold text-ocean-900">
                    City / Town
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g., Ericeira"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where is your organization based?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-bold text-ocean-900">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., Portugal"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This helps coaches find opportunities in their preferred location
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="space-y-7">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center rounded-full bg-ocean-50 p-3 mb-4">
                    <Globe2 className="h-6 w-6 text-ocean-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-ocean-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@yourorganization.com"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact email for inquiries
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-bold text-ocean-900">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+351 912 345 678"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code for international reach
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-bold text-ocean-900">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourorganization.com"
                    className="border-2 border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your official website URL
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="border-t-2 border-ocean-100 pt-8 mt-8 flex justify-between gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-12 border-2"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {step === 1 && (
                <Link href="/dashboard" className="ml-auto">
                  <Button variant="outline" className="h-12 border-2" size="lg">
                    Cancel
                  </Button>
                </Link>
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto h-12 text-base font-bold shadow-xl hover:shadow-2xl"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name || !formData.country}
                  className="ml-auto h-12 text-base font-bold shadow-xl hover:shadow-2xl"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Create Organization Profile
                    </>
                  )}
                </Button>
              )}
            </div>

            {step === totalSteps && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                You can add photos, videos, and more details after creating your profile
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrganizationPage() {
  return (
    <AuthGuard>
      <OrganizationOnboardingWizard />
    </AuthGuard>
  );
}
