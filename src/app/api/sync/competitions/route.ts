import { NextResponse } from "next/server";
import { syncCompetitions } from "@/lib/api-football";

export async function GET(request) {
  const season = request.nextUrl.searchParams.get("season");

  if (!season) {
    return NextResponse.json(
      { error: "Missing season parameter" },
      { status: 400 },
    );
  }

  try {
    const competitions = await syncCompetitions(season);
    return NextResponse.json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (err) {
    const message = err && err.message ? err.message : "Unknown error";
    console.error("Sync competitions error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
