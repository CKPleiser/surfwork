/**
 * Organization Signup Page
 * Single-page form for organization registration
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizationSignup } from "@/lib/mutations/useSignup";
import {
  organizationSignupSchema,
  type OrganizationSignupFormData,
} from "@/lib/validations/organization-signup";
import { COUNTRIES } from "@/lib/constants";
import { FormSection } from "@/components/forms/FormSection";
import { PasswordFields } from "@/components/forms/PasswordFields";
import { FileUploadButton } from "@/components/forms/FileUploadButton";
import { OptionalBadge } from "@/components/forms/OptionalBadge";
import { uploadOrgLogo } from "./actions";
import { errorTracker } from "@/lib/utils/error-tracking";

const ORG_TYPE_OPTIONS = [
  { value: "school", label: "Surf School" },
  { value: "camp", label: "Surf Camp" },
  { value: "shop", label: "Surf Shop" },
  { value: "agency", label: "Agency / Recruitment" },
  { value: "other", label: "Other" },
] as const;

function OrganizationSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: signup, isPending } = useOrganizationSignup();

  // Get URL parameters
  const redirectTo = searchParams.get("redirect");
  const isUpgrade = searchParams.get("upgrade") === "true";

  // Form state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm<OrganizationSignupFormData>({
    resolver: zodResolver(organizationSignupSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      org_type: "school",
      country: "",
      city: "",
      about: "",
      website: "",
      instagram: "",
      whatsapp: "",
      contact_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const orgName = watch("name");

  const onSubmit = async (data: OrganizationSignupFormData) => {
    signup(data, {
      onSuccess: async (result) => {
        if (result?.success && result.organizationId) {
          // Upload logo if provided
          if (logoFile) {
            const formData = new FormData();
            formData.append("file", logoFile);
            formData.append("orgId", result.organizationId);

            const uploadResult = await uploadOrgLogo(formData);
            if (uploadResult.error) {
              errorTracker.logError("Logo upload failed", { error: uploadResult.error, organizationId: result.organizationId });
            }
          }

          // Redirect based on signup method
          if (result.usingMagicLink) {
            // Magic link: redirect to check-email page
            router.push(`/auth/check-email?email=${encodeURIComponent(result.email)}`);
          } else {
            // Password: user is already signed in, redirect to intended destination or dashboard
            router.push(redirectTo || "/dashboard");
          }
        }
      },
      onError: (error) => {
        errorTracker.logError("Organization signup failed", { error: error.message });
        alert(`Signup failed: ${error.message}`);
      },
    });
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/crew")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isUpgrade ? (
            <>
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-ocean-50 border-2 border-ocean-200">
                <Building2 className="h-8 w-8 text-ocean-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create an Organization Account
              </h1>
              <p className="text-gray-600">
                You&apos;ll need an organization account to post jobs. Your crew profile will remain active.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Post jobs and find crew
              </h1>
              <p className="text-gray-600">
                Create your organization profile to connect with surf professionals worldwide
              </p>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: About Your Organization */}
          <FormSection title="About your company">

            {/* Organization Name */}
            <div>
              <Label htmlFor="name">Company name *</Label>
              <Input
                id="name"
                {...register("name")}
                className="mt-1"
                placeholder="e.g. Paradise Surf Camp"
              />
              {errors.name && touchedFields.name && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
              {orgName && (
                <p className="text-xs text-gray-500 mt-1">
                  Your profile: surfwork.com/o/{orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                </p>
              )}
            </div>

            {/* Organization Type */}
            <div>
              <Label htmlFor="org_type">Company type *</Label>
              <Select
                onValueChange={(value) => setValue("org_type", value as any)}
                defaultValue="school"
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.org_type && touchedFields.org_type && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.org_type.message}
                </p>
              )}
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select onValueChange={(value) => setValue("country", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && touchedFields.country && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="city">City</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <Input
                id="city"
                {...register("city")}
                className="mt-1"
                placeholder="e.g. Lagos"
              />
            </div>

              {/* Logo Upload */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label>Company logo</Label>
                <OptionalBadge />
              </div>
              <div className="mt-2">
                <FileUploadButton
                  variant="logo"
                  maxSizeMB={5}
                  onFileSelect={(file, previewUrl) => {
                    setLogoFile(file);
                    setLogoPreview(previewUrl);
                  }}
                  onFileRemove={() => {
                    setLogoFile(null);
                    setLogoPreview(null);
                  }}
                  previewUrl={logoPreview}
                />
              </div>
            </div>

            {/* About */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="about">Company tagline</Label>
                <OptionalBadge />
              </div>
              <Textarea
                id="about"
                {...register("about")}
                className="mt-1"
                placeholder="e.g. We offer professional surf coaching for all levels in the beautiful Algarve region of Portugal..."
                rows={3}
                maxLength={600}
              />
              <p className="text-xs text-gray-500 mt-1">Max 600 characters</p>
            </div>
          </FormSection>

          {/* Section 2: Contact & Social */}
          <FormSection title="Contact & Social">
            <p className="text-base font-normal text-gray-500 -mt-4 mb-2">All optional</p>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                className="mt-1"
                placeholder="https://www.example.com"
                type="url"
              />
              {errors.website && touchedFields.website && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Instagram */}
            <div>
              <Label htmlFor="instagram">Company Instagram</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  @
                </span>
                <Input
                  id="instagram"
                  {...register("instagram")}
                  className="pl-7"
                  placeholder="acme"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <Label htmlFor="whatsapp">Company WhatsApp</Label>
              <Input
                id="whatsapp"
                {...register("whatsapp")}
                className="mt-1"
                placeholder="+351 123 456 789"
                type="tel"
              />
            </div>
          </FormSection>

          {/* Section 3: Create Your Account */}
          <FormSection title="Create your employer account">

            {/* Contact Name */}
            <div>
              <Label htmlFor="contact_name">Contact name *</Label>
              <Input
                id="contact_name"
                {...register("contact_name")}
                className="mt-1"
                placeholder="Your full name"
              />
              {errors.contact_name && touchedFields.contact_name && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.contact_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Company email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
                placeholder="contact@acme.com"
              />
              {errors.email && touchedFields.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordFields
                register={register}
                errors={errors}
                touchedFields={touchedFields}
                checkTouched={true}
              />
            </div>

            <p className="text-sm text-gray-500">
              Leave password blank to receive a magic link via email instead.
            </p>
          </FormSection>

          {/* Terms and Submit */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-4">
            <p className="text-sm text-gray-600">
              By clicking the button below, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms Of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrganizationSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-12 bg-gradient-to-br from-sand-50 via-cream-50 to-ocean-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-6" />
            <div className="h-12 bg-gray-200 rounded w-96 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-64" />
          </div>
          <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 p-8">
            <div className="space-y-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    }>
      <OrganizationSignupContent />
    </Suspense>
  );
}
