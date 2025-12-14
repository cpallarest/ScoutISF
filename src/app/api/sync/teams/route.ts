import { NextRequest, NextResponse } from "next/server";
import { syncTeams } from "@/lib/api-football";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const competitionId = searchParams.get("competitionId");
  const season = searchParams.get("season");

  if (!competitionId || !season) {
    return NextResponse.json({ error: "Missing competitionId or season parameter" }, { status: 400 });
  }

  try {
    const teams = await syncTeams(competitionId, season);
    return NextResponse.json({ success: true, count: teams.length, data: teams });
  } catch (error: any) {
    console.error("Sync teams error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
