/**
 * API Route: GET /api/organization/applications
 * List applications for organization's jobs
 */

import { NextResponse } from "next/server";
import { getOrganizationApplications } from "@/lib/services/applications";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user and their organization
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's organizations
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_profile_id", user.id);

    if (!organizations || organizations.length === 0) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Use the first organization (in future, might support multiple)
    const organizationId = organizations[0]!.id;

    const { data, error } = await getOrganizationApplications(organizationId);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/organization/applications] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}