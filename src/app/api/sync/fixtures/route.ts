import { NextRequest, NextResponse } from "next/server";
import { syncFixtures } from "@/lib/api-football";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const competitionId = searchParams.get("competitionId");
  const season = searchParams.get("season");
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  if (!competitionId || !season) {
    return NextResponse.json({ error: "Missing competitionId or season parameter" }, { status: 400 });
  }

  try {
    const fixtures = await syncFixtures(competitionId, season, from, to);
    return NextResponse.json({ success: true, count: fixtures.length, data: fixtures });
  } catch (error: any) {
    console.error("Sync fixtures error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
