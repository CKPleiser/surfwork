/**
 * Crew Signup Page
 * Single-page form for crew member registration
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X } from "lucide-react";
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
import { useCrewSignup } from "@/lib/mutations/useCrewSignup";
import {
  crewSignupSchema,
  type CrewSignupFormData,
} from "@/lib/validations/crew-signup";
import { COUNTRIES } from "@/lib/constants";
import { uploadAvatar } from "./actions";

const ROLE_OPTIONS = [
  { value: "coach", label: "Surf Coach / Instructor" },
  { value: "media", label: "Photographer / Videographer" },
  { value: "camp_staff", label: "Chef / Kitchen Staff" },
  { value: "ops", label: "Camp Manager / Operations" },
  { value: "other", label: "Other (Yoga, Massage, etc.)" },
] as const;

const REGION_OPTIONS = [
  "Portugal",
  "Spain",
  "Morocco",
  "Canary Islands",
  "France",
  "Bali",
  "Costa Rica",
  "Nicaragua",
  "Mexico",
  "Sri Lanka",
  "Anywhere",
];

const COMPENSATION_OPTIONS = [
  { value: "salary", label: "Paid (salary/wage)" },
  { value: "day_rate", label: "Day Rate" },
  { value: "exchange", label: "Room & Meals" },
  { value: "volunteer", label: "Volunteer" },
] as const;

export default function CrewSignupPage() {
  const router = useRouter();
  const { mutate: signup, isPending } = useCrewSignup();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const toggleRole = (role: string) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter((r) => r !== role)
      : [...selectedRoles, role];
    setSelectedRoles(newRoles);
    setValue("roles", newRoles as any);
  };

  const toggleRegion = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    setSelectedRegions(newRegions);
    setValue("preferred_regions", newRegions);
  };

  const toggleCompensation = (comp: string) => {
    const newComp = selectedCompensation.includes(comp)
      ? selectedCompensation.filter((c) => c !== comp)
      : [...selectedCompensation, comp];
    setSelectedCompensation(newComp);
    setValue("open_to", newComp as any);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue("skills", newSkills);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    const newSkills = skills.filter((s) => s !== skill);
    setSkills(newSkills);
    setValue("skills", newSkills);
  };

  const onSubmit = async (data: CrewSignupFormData) => {
    signup(data, {
      onSuccess: async (result) => {
        if (result?.success && result.userId) {
          if (avatarFile) {
            const uploadResult = await uploadAvatar(avatarFile, result.userId);
            if (uploadResult.error) {
              console.error("Avatar upload failed:", uploadResult.error);
            }
          }
          router.push("/dashboard");
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
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Tell us about yourself
            </h2>

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
                  <p className="text-sm text-red-600 mt-1">
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
                  <p className="text-sm text-red-600 mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="country">Where are you based right now?</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
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
              <div className="flex items-center gap-2">
                <Label>Profile Photo</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-ocean-400 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Upload a photo (max 2MB)
                  </p>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview(null);
                        setAvatarFile(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 mt-1"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Availability Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Your skills & availability
            </h2>

            {/* Roles */}
            <div>
              <Label>What&apos;s your role? *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors ${
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
                <p className="text-sm text-red-600 mt-1">
                  {errors.roles.message}
                </p>
              )}
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="skillInput">Your skills & certifications</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
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
                        className="hover:text-ocean-900"
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
              <div className="flex items-center gap-2">
                <Label>Show your work (links to portfolio, social media)</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="about">Tell us about your work experience</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="availability_start">When can you start?</Label>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>
                <Input
                  id="availability_start"
                  type="date"
                  {...register("availability_start")}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="availability_end">Until when?</Label>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
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
            <div>
              <div className="flex items-center gap-2">
                <Label>Where would you like to work?</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {REGION_OPTIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors ${
                      selectedRegions.includes(region)
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700 font-medium"
                        : "border-gray-300 hover:border-ocean-300"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Open To */}
            <div>
              <div className="flex items-center gap-2">
                <Label>What type of compensation are you open to?</Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMPENSATION_OPTIONS.map((comp) => (
                  <button
                    key={comp.value}
                    type="button"
                    onClick={() => toggleCompensation(comp.value)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors ${
                      selectedCompensation.includes(comp.value)
                        ? "border-ocean-500 bg-ocean-50 text-ocean-700 font-medium"
                        : "border-gray-300 hover:border-ocean-300"
                    }`}
                  >
                    {comp.label}
                  </button>
                ))}
              </div>
            </div>

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
                    <p className="text-sm text-red-600 mt-1">
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
                    <p className="text-sm text-red-600 mt-1">
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
                    <p className="text-sm text-red-600 mt-1">
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
                    <p className="text-sm text-red-600 mt-1">
                      {errors.contact_value.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    {...register("is_public")}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public" className="cursor-pointer">
                    Make my profile publicly visible
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Create Account Section */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Create your account
            </h2>

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
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1"
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1"
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

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
