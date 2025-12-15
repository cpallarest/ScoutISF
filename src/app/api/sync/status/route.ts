import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const baseUrl = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

  if (!apiKey) {
    return NextResponse.json({ 
      api_reachable: false, 
      error: "API_FOOTBALL_KEY not set" 
    }, { status: 500 });
  }

  try {
    const start = Date.now();
    const response = await fetch(`${baseUrl}/status`, {
      headers: {
        "x-apisports-key": apiKey,
      },
      cache: "no-store",
    });
    const duration = Date.now() - start;

    const data = await response.json();

    return NextResponse.json({
      api_reachable: response.ok,
      http_status: response.status,
      latency_ms: duration,
      base_url: baseUrl,
      subscription: data.response?.subscription || null,
      requests: data.response?.requests || null,
      errors: data.errors || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      api_reachable: false,
      error: error.message,
      base_url: baseUrl,
    }, { status: 500 });
  }
}
