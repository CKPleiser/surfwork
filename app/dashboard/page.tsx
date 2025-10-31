/**
 * Dashboard Page - Server Component Pattern
 * Routes to appropriate dashboard based on user type (crew vs organization)
 */

import { getUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CrewDashboard } from "./CrewDashboard";
import { OrgDashboard } from "./OrgDashboard";

export default async function DashboardPage() {
  // Server-side auth check with React cache() - zero delay, no flicker
  const user = await getUser();

  // Redirect to signin if not authenticated
  if (!user) {
    redirect("/auth?redirect=/dashboard");
  }

  // Route to appropriate dashboard based on user type
  // Organizations have profile.kind === "org"
  // Crew members have profile.kind === "person"
  const isOrganization = user.profile?.kind === "org";

  if (isOrganization) {
    return <OrgDashboard user={user} />;
  }

  return <CrewDashboard user={user} />;
}
