/**
 * Post Job Page
 * Protected route - requires organization account
 * Server Component performs auth check, redirects if needed
 */

import { redirect } from "next/navigation";
import { requireOrgAccount } from "@/lib/auth/session";
import { PostJobClient } from "./PostJobClient";

export default async function PostJobPage() {
  // Server-side auth check - redirect if not authenticated or not an organization
  try {
    await requireOrgAccount();
  } catch (error) {
    redirect("/auth?redirect=/jobs/new");
  }

  return <PostJobClient />;
}
