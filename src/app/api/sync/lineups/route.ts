import { NextRequest, NextResponse } from "next/server";
import { syncLineups } from "@/lib/api-football";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fixtureId = searchParams.get("fixtureId");

  if (!fixtureId) {
    return NextResponse.json({ error: "Missing fixtureId parameter" }, { status: 400 });
  }

  try {
    const result = await syncLineups(fixtureId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sync lineups error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
