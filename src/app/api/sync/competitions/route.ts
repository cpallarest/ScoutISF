import { NextRequest, NextResponse } from "next/server";
import { syncCompetitions } from "@/lib/api-football";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season = searchParams.get("season");

  if (!season) {
    return NextResponse.json({ error: "Missing season parameter" }, { status: 400 });
  }

  try {
    const competitions = await syncCompetitions(season);
    return NextResponse.json({ success: true, count: competitions.length, data: competitions });
  } catch (error: any) {
    console.error("Sync competitions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
