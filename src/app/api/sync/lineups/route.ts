import { NextRequest, NextResponse } from "next/server";
import { syncLineups } from "@/lib/api-football";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const fixtureId = sp.get("fixtureId");

  if (!fixtureId) {
    return NextResponse.json(
      { success: false, error: "Missing fixtureId parameter" },
      { status: 400 },
    );
  }

  if (!isUuid(fixtureId)) {
    return NextResponse.json(
      { success: false, error: "fixtureId must be a UUID" },
      { status: 400 },
    );
  }

  try {
    const result = await syncLineups(fixtureId);
    const ok = result?.status === "success";

    return NextResponse.json(
      { success: true, count: ok ? 1 : 0, data: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: any) {
    console.error("Sync lineups error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
