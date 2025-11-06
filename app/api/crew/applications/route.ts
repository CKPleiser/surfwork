/**
 * API Route: GET /api/crew/applications
 * List current user's job applications
 */

import { NextResponse } from "next/server";
import { getUserApplications } from "@/lib/services/applications";

export async function GET() {
  try {
    const { data, error } = await getUserApplications();

    if (error) {
      if (error === "Authentication required") {
        return NextResponse.json(
          { error },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/crew/applications] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}