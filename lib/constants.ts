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
