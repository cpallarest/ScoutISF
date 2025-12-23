import { NextRequest, NextResponse } from "next/server";
import { syncFixtures } from "@/lib/api-football";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function isISODate(v: string) {
  // YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const competitionId = sp.get("competitionId");
  const season = sp.get("season");
  const from = sp.get("from") ?? undefined;
  const to = sp.get("to") ?? undefined;

  if (!competitionId || !season) {
    return NextResponse.json(
      { success: false, error: "Missing competitionId or season parameter" },
      { status: 400 },
    );
  }

  if (!isUuid(competitionId)) {
    return NextResponse.json(
      { success: false, error: "competitionId must be a UUID" },
      { status: 400 },
    );
  }

  if (from && !isISODate(from)) {
    return NextResponse.json(
      { success: false, error: "from must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  if (to && !isISODate(to)) {
    return NextResponse.json(
      { success: false, error: "to must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    const fixtures = await syncFixtures(competitionId, season, from, to);
    return NextResponse.json(
      { success: true, count: fixtures.length, data: fixtures },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: any) {
    console.error("Sync fixtures error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
