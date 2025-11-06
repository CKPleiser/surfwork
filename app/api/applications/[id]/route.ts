/**
 * API Route: PATCH /api/applications/{id}
 * Update application status (for organizations)
 */

import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus } from "@/lib/services/applications";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ApplicationStatus } from "@/lib/supabase/types";

const updateSchema = z.object({
  status: z.enum(["pending", "viewed", "contacted", "archived"] as const),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const validation = updateSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

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

    const organizationId = organizations[0]!.id;

    const { data, error } = await updateApplicationStatus({
      applicationId: params.id,
      status: validation.data.status as ApplicationStatus,
      organizationId,
    });

    if (error) {
      if (error === "Unauthorized") {
        return NextResponse.json(
          { error },
          { status: 403 }
        );
      }
      if (error === "Application not found") {
        return NextResponse.json(
          { error },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[PATCH /api/applications/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}