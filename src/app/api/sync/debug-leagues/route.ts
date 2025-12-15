import { NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const season = searchParams.get("season") || "2024";

  if (!API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Missing API_FOOTBALL_KEY" },
      { status: 500 },
    );
  }

  const url = new URL(`${BASE_URL}/leagues`);
  url.searchParams.set("season", season);

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": API_KEY },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  // devolvemos “lo importante” para entender por qué viene vacío
  return NextResponse.json({
    httpOk: res.ok,
    httpStatus: res.status,
    season,
    hasResponseArray: Array.isArray(json?.response),
    responseLength: Array.isArray(json?.response) ? json.response.length : null,
    results: json?.results ?? null,
    errors: json?.errors ?? null,
    message: json?.message ?? null,
    parameters: json?.parameters ?? null,
    // si quieres ver 1 item de muestra:
    sample: Array.isArray(json?.response) ? json.response[0] : null,
  });
}
