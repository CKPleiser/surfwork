/**
 * API Route: GET /api/jobs/{id}/applications
 * Check if current user has applied to a job
 */

import { NextRequest, NextResponse } from "next/server";
import { hasUserAppliedToJob } from "@/lib/services/applications";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await hasUserAppliedToJob(params.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/jobs/[id]/applications] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}