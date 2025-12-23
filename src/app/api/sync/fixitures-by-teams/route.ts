import { NextRequest, NextResponse } from "next/server";
import { syncFixturesByTeam } from "@/lib/api-football";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const teamId = sp.get("teamId");
  const season = sp.get("season");

  if (!teamId || !season) {
    return NextResponse.json(
      { success: false, error: "Missing teamId or season" },
      { status: 400 },
    );
  }

  if (!isUuid(teamId)) {
    return NextResponse.json(
      { success: false, error: "teamId must be a UUID" },
      { status: 400 },
    );
  }

  try {
    const fixtures = await syncFixturesByTeam(teamId, season);
    return NextResponse.json(
      { success: true, count: fixtures.length, data: fixtures },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: any) {
    console.error("sync fixtures-by-team error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
