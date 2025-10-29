/**
 * Crew Signup Page
 * Single-page form for crew member registration
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, X } from "lucide-react";
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
import { useCrewSignup } from "@/lib/mutations/useSignup";
import {
  crewSignupSchema,
  type CrewSignupFormData,
} from "./schema";
import {
  COUNTRIES,
  CREW_ROLE_OPTIONS,
  CREW_REGION_OPTIONS,
  CREW_COMPENSATION_OPTIONS,
} from "@/lib/constants";
import { FormSection } from "@/components/forms/FormSection";
import { PasswordFields } from "@/components/forms/PasswordFields";
import { FileUploadButton } from "@/components/forms/FileUploadButton";
import { OptionalBadge } from "@/components/forms/OptionalBadge";
import { uploadAvatar } from "./actions";
import { errorTracker } from "@/lib/utils/error-tracking";

export default function CrewSignupPage() {
  const router = useRouter();
  const { mutate: signup, isPending } = useCrewSignup();

  // Form state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCompensation, setSelectedCompensation] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<CrewSignupFormData>({
    resolver: zodResolver(crewSignupSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      bio: "",
      avatar_url: "",
      is_public: true,
      roles: [],
      skills: [],
      links: {
        instagram: "",
        portfolio: "",
        site: "",
        whatsapp: "",
      },
      about: "",
      availability_start: "",
      availability_end: "",
      preferred_regions: [],
      open_to: [],
      pitch_title: "",
      pitch_description: "",
      contact_method: "email",
      contact_value: "",
    },
  });

  const toggleRole = useCallback((role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    setValue("roles", newRoles as any);
  }, [selectedRoles, setValue]);

  const toggleRegion = useCallback((region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    setValue("preferred_regions", newRegions);
  }, [selectedRegions, setValue]);

  const toggleCompensation = useCallback((comp: string) => {
    const newComp = selectedCompensation.includes(comp)
      ? selectedCompensation.filter((c) => c !== comp)
      : [...selectedCompensation, comp];
    setSelectedCompensation(newComp);
    setValue("open_to", newComp as any);
  }, [selectedCompensation, setValue]);

  const addSkill = useCallback(() => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills);
      setSkillInput("");
    }
  }, [skillInput, skills, setValue]);

  const removeSkill = useCallback((skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    setValue("skills", newSkills);
  }, [skills, setValue]);

  const onSubmit = async (data: CrewSignupFormData) => {
    signup(data, {
      onSuccess: async (result) => {
        if (result?.success && result.userId) {
          // Upload avatar if provided
          if (avatarFile) {
            const uploadResult = await uploadAvatar(avatarFile, result.userId);
            if (uploadResult.error) {
              errorTracker.logError("Avatar upload failed", { error: uploadResult.error, userId: result.userId });
            }
          }

          // Redirect based on signup method
          if (result.usingMagicLink) {
            // Magic link: redirect to check-email page
            router.push(`/auth/check-email?email=${encodeURIComponent(result.email)}`);
          } else {
            // Password: user is already signed in, redirect to dashboard
            router.push("/dashboard");
          }
        }
      },
      onError: (error) => {
        alert(`Signup failed: ${error.message}`);
      },
    });
  };

  return (
    <div className="min-h-screen py-12">
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join the crew
          </h1>
          <p className="text-gray-600">
            Create your profile to connect with surf camps worldwide
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* About You Section */}
          <FormSection title="Tell us about yourself">

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  className="mt-1"
                  placeholder="e.g. Sarah"
                />
                {errors.first_name && touchedFields.first_name && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  className="mt-1"
                  placeholder="e.g. Johnson"
                />
                {errors.last_name && touchedFields.last_name && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="country">Where are you based right now?</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <Select onValueChange={(value) => setValue("country", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your current location" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <Textarea
                id="bio"
                {...register("bio")}
                className="mt-1"
                placeholder="e.g. ISA certified surf instructor with 5 years experience teaching all levels. Passionate about ocean conservation and creating fun, safe learning environments..."
                rows={3}
                maxLength={600}
              />
              <p className="text-xs text-gray-500 mt-1">Max 600 characters</p>
            </div>

            {/* Avatar Upload */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label>Profile Photo</Label>
                <OptionalBadge />
              </div>
              <div className="mt-2">
                <FileUploadButton
                  variant="avatar"
                  maxSizeMB={2}
                  onFileSelect={(file, previewUrl) => {
                    setAvatarFile(file);
                    setAvatarPreview(previewUrl);
                  }}
                  onFileRemove={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  previewUrl={avatarPreview}
                />
              </div>
            </div>
          </FormSection>

          {/* Skills & Availability Section */}
          <FormSection title="Your skills & availability">

            {/* Roles */}
            <fieldset>
              <legend className="text-sm font-medium text-gray-900 mb-2">What&apos;s your role? *</legend>
              <div className="flex flex-wrap gap-2">
                {CREW_ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    role="button"
                    aria-pressed={selectedRoles.includes(role.value)}
                    onClick={() => toggleRole(role.value)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 outline-none ${
                      selectedRoles.includes(role.value)
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700 font-medium"
                        : "border-gray-300 hover:border-ocean-300"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              {errors.roles && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.roles.message}
                </p>
              )}
            </fieldset>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="skillInput">Your skills & certifications</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <div className="mt-1 flex gap-2">
                <Input
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="e.g. ISA Level 2, Lifeguard, First Aid CPR, GoPro filming"
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-ocean-50 text-ocean-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="hover:text-ocean-900 focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-1 rounded outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Label>Show your work (links to portfolio, social media)</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <Input
                {...register("links.instagram")}
                placeholder="https://instagram.com/your_handle"
                className="mt-1"
              />
              <Input
                {...register("links.portfolio")}
                placeholder="https://yourportfolio.com"
              />
              <Input
                {...register("links.site")}
                placeholder="https://yourwebsite.com"
              />
              <Input
                {...register("links.whatsapp")}
                placeholder="+351 912 345 678"
              />
            </div>

            {/* About Your Work */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="about">Tell us about your work experience</Label>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <Textarea
                id="about"
                {...register("about")}
                className="mt-1"
                placeholder="e.g. I've been teaching surf for 6 years across Portugal and Morocco. Started as a beach assistant and worked my way up to head coach. I love working with beginners and seeing their first waves. Also experienced in camp operations and social media content creation..."
                rows={4}
                maxLength={1500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 1500 characters
              </p>
            </div>

            {/* Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="availability_start">When can you start?</Label>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
                </div>
                <Input
                  id="availability_start"
                  type="date"
                  {...register("availability_start")}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="availability_end">Until when?</Label>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
                </div>
                <Input
                  id="availability_end"
                  type="date"
                  {...register("availability_end")}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Preferred Regions */}
            <fieldset>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <legend className="text-sm font-medium text-gray-900">Where would you like to work?</legend>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {CREW_REGION_OPTIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    role="button"
                    aria-pressed={selectedRegions.includes(region)}
                    onClick={() => toggleRegion(region)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 outline-none ${
                      selectedRegions.includes(region)
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700 font-medium"
                        : "border-gray-300 hover:border-ocean-300"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Open To */}
            <fieldset>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <legend className="text-sm font-medium text-gray-900">What type of compensation are you open to?</legend>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">Optional</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {CREW_COMPENSATION_OPTIONS.map((comp) => (
                  <button
                    key={comp.value}
                    type="button"
                    role="button"
                    aria-pressed={selectedCompensation.includes(comp.value)}
                    onClick={() => toggleCompensation(comp.value)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 outline-none ${
                      selectedCompensation.includes(comp.value)
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700 font-medium"
                        : "border-gray-300 hover:border-ocean-300"
                    }`}
                  >
                    {comp.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Pitch */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your pitch to camps
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="pitch_title">Pitch Title *</Label>
                  <Input
                    id="pitch_title"
                    {...register("pitch_title")}
                    className="mt-1"
                    placeholder="e.g. Experienced Surf Coach Ready for Summer Season"
                    maxLength={80}
                  />
                  {errors.pitch_title && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.pitch_title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pitch_description">Description *</Label>
                  <Textarea
                    id="pitch_description"
                    {...register("pitch_description")}
                    className="mt-1"
                    placeholder="Describe what makes you a great fit for surf camps..."
                    rows={4}
                    maxLength={800}
                  />
                  {errors.pitch_description && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.pitch_description.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max 800 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="contact_method">
                    Preferred Contact Method *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("contact_method", value as any)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How should camps contact you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="link">
                        Link (website/form)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.contact_method && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.contact_method.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_value">Contact Info *</Label>
                  <Input
                    id="contact_value"
                    {...register("contact_value")}
                    className="mt-1"
                    placeholder="Email, phone, or link"
                  />
                  {errors.contact_value && (
                    <p className="text-sm text-red-600 mt-1" role="alert">
                      {errors.contact_value.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="is_public" className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="is_public"
                      {...register("is_public")}
                      className="rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Make my profile publicly visible
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Create Account Section */}
          <FormSection title="Create your account">

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <PasswordFields
              register={register}
              errors={errors}
              showRequired={true}
            />
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isPending ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
