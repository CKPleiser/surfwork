/**
 * Dashboard Page - Server Component Pattern
 * Demonstrates server-first authentication with zero-delay auth state
 */

import { getUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load the heavy DashboardClient component
const DashboardClient = dynamic(() => import("./DashboardClient").then(mod => ({ default: mod.DashboardClient })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  ssr: false, // Client-only component, no SSR needed
});

export default async function DashboardPage() {
  // Server-side auth check with React cache() - zero delay, no flicker
  const user = await getUser();

  // Redirect to signin if not authenticated
  if (!user) {
    redirect("/auth?redirect=/dashboard");
  }

  // Pass user to Client Component - no React Query needed for initial render
  return <DashboardClient user={user} />;
}
