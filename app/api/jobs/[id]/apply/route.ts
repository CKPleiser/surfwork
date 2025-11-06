/**
 * API Route: POST /api/jobs/{id}/apply
 * Create a new job application
 */

import { NextRequest, NextResponse } from "next/server";
import { createApplication } from "@/lib/services/applications";
import { z } from "zod";

const applySchema = z.object({
  message: z.string().min(50).max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const json = await req.json();
    const validation = applySchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await createApplication({
      jobId: params.id,
      message: validation.data.message,
    });

    if (error) {
      // Check for specific error types
      if (error === "Authentication required") {
        return NextResponse.json(
          { error },
          { status: 401 }
        );
      }
      if (error === "You have already applied for this job") {
        return NextResponse.json(
          { error },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/jobs/[id]/apply] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}