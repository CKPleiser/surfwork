/**
 * Crew Profile Edit Page - Server Component
 * Fetches user profile data and renders edit form
 */

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CrewProfileEditForm } from "./CrewProfileEditForm";

export default async function CrewProfileEditPage() {
  // Get authenticated user
  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is crew (not organization)
  if (user.profile?.kind !== "person") {
    redirect("/dashboard");
  }

  // Fetch full profile data
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-ocean bg-clip-text text-transparent">
              Edit Your Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Update your information to help surf organizations find you
            </p>
          </div>

          <CrewProfileEditForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
