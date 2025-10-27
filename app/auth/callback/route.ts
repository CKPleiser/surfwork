import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/onboarding";

  if (code) {
    const supabase = createClient();

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          // User has completed onboarding, redirect to requested page or dashboard
          return NextResponse.redirect(
            new URL(next === "/onboarding" ? "/dashboard" : next, request.url)
          );
        }
      }

      // Redirect to onboarding for new users
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // If there's an error or no code, redirect to auth page
  return NextResponse.redirect(new URL("/auth?error=true", request.url));
}
