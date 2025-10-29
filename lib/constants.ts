/**
 * Application Constants
 */

export const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "CR", name: "Costa Rica" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "ID", name: "Indonesia" },
  { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" },
  { code: "NZ", name: "New Zealand" },
  { code: "PT", name: "Portugal" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "OTHER", name: "Other" },
] as const;

export const SPORTS = [
  { value: "surf", label: "Surf" },
  { value: "kite", label: "Kite" },
  { value: "wing", label: "Wing" },
  { value: "sup", label: "SUP" },
  { value: "windsurf", label: "Windsurf" },
  { value: "bodyboard", label: "Bodyboard" },
] as const;

export const JOB_ROLES = [
  "Surf Coach",
  "Head Coach",
  "Surf Instructor",
  "Kite Instructor",
  "Wing Instructor",
  "SUP Instructor",
  "Manager",
  "Admin",
  "Marketing",
  "Content Creator",
  "Videographer",
  "Photographer",
  "Other",
] as const;

export const CREW_ROLE_OPTIONS = [
  { value: "coach", label: "Surf Coach / Instructor" },
  { value: "media", label: "Photographer / Videographer" },
  { value: "camp_staff", label: "Chef / Kitchen Staff" },
  { value: "ops", label: "Camp Manager / Operations" },
  { value: "other", label: "Other (Yoga, Massage, etc.)" },
] as const;

export const CREW_REGION_OPTIONS = [
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
] as const;

export const CREW_COMPENSATION_OPTIONS = [
  { value: "salary", label: "Paid (salary/wage)" },
  { value: "day_rate", label: "Day Rate" },
  { value: "exchange", label: "Room & Meals" },
  { value: "volunteer", label: "Volunteer" },
] as const;

export const HOME_ROLES = ["all", "coach", "media", "camp_staff", "ops", "other"] as const;

export const HOME_ROLE_LABELS: Record<string, string> = {
  all: "All Roles",
  coach: "Coach",
  media: "Media",
  camp_staff: "Camp Staff",
  ops: "Operations",
  other: "Other",
};

export const HOME_TAGS = ["chef", "shaper", "photographer", "repair", "manager", "yoga", "ISA L1", "ISA L2"] as const;
