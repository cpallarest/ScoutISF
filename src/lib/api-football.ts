import { createAdminClient } from "@/supabase/admin";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL =
  process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

if (!API_KEY) console.warn("API_FOOTBALL_KEY is not set");

type SupabaseClient = ReturnType<typeof createAdminClient>;

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function asArrayResponse(json: any): any[] {
  return Array.isArray(json?.response) ? json.response : [];
}

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  console.log(`[API-Football] GET ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: { "x-apisports-key": API_KEY! },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API-Football error: ${res.status} ${res.statusText} ${text}`.trim(),
    );
  }

  return res.json();
}

async function getCachedData(supabase: SupabaseClient, key: string) {
  const { data, error } = await supabase
    .from("provider_cache")
    .select("data, expires_at")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  if (!data.expires_at) return null;

  const ok = new Date(data.expires_at).getTime() > Date.now();
  return ok ? data.data : null;
}

async function setCachedData(
  supabase: SupabaseClient,
  key: string,
  data: any,
  durationSeconds: number,
) {
  const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
  await supabase
    .from("provider_cache")
    .upsert({ key, data, expires_at: expiresAt }, { onConflict: "key" });
}

/**
 * COMPETITIONS
 * API: GET /leagues?season=YYYY
 */
export async function syncCompetitions(season: string) {
  const supabase = createAdminClient();
  const cacheKey = `competitions_${season}`;

  let items: any[] = [];
  const cached = await getCachedData(supabase, cacheKey);
  if (Array.isArray(cached) && cached.length) {
    items = cached;
    console.log(`[syncCompetitions] cache hit: ${items.length}`);
  } else {
    const json = await fetchFromApi("/leagues", { season });
    items = asArrayResponse(json);
    console.log(`[syncCompetitions] api items: ${items.length}`);

    // No guardes vacío en cache (evita “cache de tristeza”)
    if (items.length) {
      await setCachedData(supabase, cacheKey, items, 7 * 24 * 60 * 60);
    }
  }

  if (!items.length) return [];

  const out: any[] = [];

  for (const item of items) {
    try {
      const league = item?.league;
      const country = item?.country;

      const leagueId = league?.id != null ? String(league.id) : "";
      const name = league?.name ? String(league.name) : "";
      if (!leagueId || !name) continue;

      const payload = {
        provider: "api_football",
        provider_competition_id: leagueId,
        name,
        country: country?.name ? String(country.name) : "",
        season,
        is_active: Boolean(league?.active),
      };

      const { data, error } = await supabase
        .from("competitions")
        .upsert(payload, {
          onConflict: "provider,provider_competition_id,season",
        })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error(`[syncCompetitions] upsert error (${name})`, error);
        continue;
      }
      if (data) out.push(data);
    } catch (e) {
      console.error("[syncCompetitions] item error", e);
    }
  }

  console.log(`[syncCompetitions] upserted: ${out.length}`);
  return out;
}

/**
 * TEAMS
 * API: GET /teams?league=LEAGUE_ID&season=YYYY
 */
export async function syncTeams(competitionId: string, season: string) {
  const supabase = createAdminClient();

  let query = supabase.from("competitions").select("provider_competition_id");
  if (isUUID(competitionId)) {
    query = query.eq("id", competitionId);
  } else {
    query = query.eq("provider_competition_id", competitionId);
  }
  
  const { data: comp, error: compErr } = await query.maybeSingle();

  if (compErr) throw compErr;
  if (!comp?.provider_competition_id)
    throw new Error("Competition not linked to provider");

  const cacheKey = `teams_${comp.provider_competition_id}_${season}`;

  let items: any[] = [];
  const cached = await getCachedData(supabase, cacheKey);
  if (cached && Array.isArray(cached)) {
    items = cached;
  } else {
    const json = await fetchFromApi("/teams", {
      league: String(comp.provider_competition_id),
      season: String(season),
    });
    items = Array.isArray(json?.response) ? json.response : [];
    if (items.length) {
      await setCachedData(supabase, cacheKey, items, 7 * 24 * 60 * 60);
    }
  }

  const out: any[] = [];

  for (const item of items) {
    const team = item?.team;
    if (!team?.id) continue;

    const payload = {
      provider: "api_football",
      provider_team_id: String(team.id),
      name: team.name ?? null,
      country: team.country ?? null,
      logo_url: team.logo ?? null,
    };

    const { data: upserted, error } = await supabase
      .from("teams")
      .upsert(payload, { onConflict: "provider,provider_team_id" })
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(`[syncTeams] upsert error (${team?.name})`, error);
      continue;
    }
    if (upserted) out.push(upserted);
  }

  return out;
}

/**
 * FIXTURES
 * API: GET /fixtures?league=LEAGUE_ID&season=YYYY&from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function syncFixtures(
  competitionId: string,
  season: string,
  from?: string,
  to?: string,
) {
  const supabase = createAdminClient();

  let query = supabase.from("competitions").select("id, provider_competition_id");
  if (isUUID(competitionId)) {
    query = query.eq("id", competitionId);
  } else {
    query = query.eq("provider_competition_id", competitionId);
  }

  const { data: comp, error: compErr } = await query.maybeSingle();

  if (compErr) throw compErr;
  if (!comp?.provider_competition_id)
    throw new Error("Competition not linked to provider");

  const leagueId = String(comp.provider_competition_id);
  const cacheKey = `fixtures_${leagueId}_${season}_${from || "all"}_${to || "all"}`;

  let items: any[] = [];
  const cached = await getCachedData(supabase, cacheKey);
  if (Array.isArray(cached) && cached.length) {
    items = cached;
    console.log(`[syncFixtures] cache hit: ${items.length}`);
  } else {
    const params: Record<string, string> = { league: leagueId, season };
    if (from) params.from = from;
    if (to) params.to = to;

    const json = await fetchFromApi("/fixtures", params);
    items = asArrayResponse(json);
    console.log(`[syncFixtures] api items: ${items.length}`);

    if (items.length) {
      await setCachedData(supabase, cacheKey, items, 6 * 60 * 60);
    }
  }

  if (!items.length) return [];

  const out: any[] = [];

  for (const item of items) {
    try {
      const fixture = item?.fixture;
      const teams = item?.teams;
      const goals = item?.goals;
      const score = item?.score;

      const fixtureId = fixture?.id != null ? String(fixture.id) : "";
      if (!fixtureId) continue;

      const homeProviderId =
        teams?.home?.id != null ? String(teams.home.id) : "";
      const awayProviderId =
        teams?.away?.id != null ? String(teams.away.id) : "";
      if (!homeProviderId || !awayProviderId) continue;

      // asegúrate de haber sincronizado teams antes
      const { data: homeTeam } = await supabase
        .from("teams")
        .select("id")
        .eq("provider", "api_football")
        .eq("provider_team_id", homeProviderId)
        .maybeSingle();

      const { data: awayTeam } = await supabase
        .from("teams")
        .select("id")
        .eq("provider", "api_football")
        .eq("provider_team_id", awayProviderId)
        .maybeSingle();

      if (!homeTeam?.id || !awayTeam?.id) continue;

      const short = fixture?.status?.short ? String(fixture.status.short) : "";
      const status =
        short === "FT" || short === "AET" || short === "PEN"
          ? "finished"
          : ["1H", "2H", "HT", "ET", "BT", "P"].includes(short)
            ? "live"
            : "scheduled";

      const payload = {
        provider: "api_football",
        provider_fixture_id: fixtureId,
        competition_id: competitionId,
        season,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        kickoff_at: fixture?.date ?? null,
        venue: fixture?.venue?.name ?? null,
        status,
        home_score: goals?.home ?? null,
        away_score: goals?.away ?? null,
        ht_home_score: score?.halftime?.home ?? null,
        ht_away_score: score?.halftime?.away ?? null,
      };

      const { data, error } = await supabase
        .from("matches")
        .upsert(payload, { onConflict: "provider,provider_fixture_id" })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error(`[syncFixtures] upsert error (${fixtureId})`, error);
        continue;
      }
      if (data) out.push(data);
    } catch (e) {
      console.error("[syncFixtures] item error", e);
    }
  }

  console.log(`[syncFixtures] upserted: ${out.length}`);
  return out;
}

export async function syncLineups(fixtureId: string) {
  const supabase = createAdminClient();
  
  let query = supabase.from("matches").select("*");
  if (isUUID(fixtureId)) {
    query = query.eq("id", fixtureId);
  } else {
    query = query.eq("provider_fixture_id", fixtureId);
  }
  
  const { data: match } = await query.maybeSingle();
  if (!match?.provider_fixture_id) throw new Error("Match not linked to provider");

  const cacheKey = `lineups_${match.provider_fixture_id}`;
  let data = await getCachedData(supabase, cacheKey);
  
  if (!data) {
    const response = await fetchFromApi("/fixtures/lineups", { fixture: match.provider_fixture_id });
    data = asArrayResponse(response);
    
    const isFinished = match.status === "finished";
    if (data.length > 0) {
        await setCachedData(supabase, cacheKey, data, isFinished ? 30 * 24 * 60 * 60 : 60 * 60);
    }
  }

  if (!data || data.length === 0) return { status: "pending" };

  // Clear existing lineups for this match
  await supabase.from("lineup_positions").delete().eq("match_id", match.id);

  for (const teamLineup of (data as any[])) {
    const providerTeamId = teamLineup.team.id.toString();
    const { data: team } = await supabase.from("teams").select("id").eq("provider_team_id", providerTeamId).maybeSingle();
    if (!team) continue;

    for (const playerItem of teamLineup.startXI) {
      const { player } = playerItem;
      
      // Find or create player
      let playerId = await findOrCreatePlayer(supabase, player);
      
      if (playerId) {
        const { x, y } = mapGridToCoordinates(player.grid);

        await supabase.from("lineup_positions").insert({
          match_id: match.id,
          team_id: team.id,
          player_id: playerId,
          is_starting_xi: true,
          shirt_number: player.number,
          position: player.pos,
          x,
          y
        });
      }
    }
  }
  
  return { status: "success" };
}

async function findOrCreatePlayer(supabase: SupabaseClient, apiPlayer: any): Promise<string | null> {
  // 1. Try provider ID
  const { data: byId } = await supabase.from("players").select("id").eq("provider_player_id", apiPlayer.id.toString()).maybeSingle();
  if (byId) return byId.id;

  // 2. Try Name
  const { data: byName } = await supabase.from("players").select("id").ilike("name", apiPlayer.name).limit(1).maybeSingle();
  if (byName) {
    // Update provider ID
    await supabase.from("players").update({ provider_player_id: apiPlayer.id.toString() }).eq("id", byName.id);
    return byName.id;
  }

  // 3. Create new
  const { data: newPlayer } = await supabase.from("players").insert({
    name: apiPlayer.name,
    provider: "api_football",
    provider_player_id: apiPlayer.id.toString(),
    position: apiPlayer.pos,
  }).select("id").single();

  return newPlayer?.id || null;
}

function mapGridToCoordinates(grid: string | null): { x: number, y: number } {
  if (!grid) return { x: 50, y: 50 };
  
  const parts = grid.split(":");
  if (parts.length !== 2) return { x: 50, y: 50 };
  
  const row = parseInt(parts[0]);
  const col = parseInt(parts[1]);
  
  // Simple mapping logic
  const y = 90 - ((row - 1) * 20); 
  const x = 10 + (col * 20); 
  
  return { x, y };
}
