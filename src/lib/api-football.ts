import { createAdminClient } from "@/supabase/admin";
import { Database } from "@/types/database.types";

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = process.env.API_FOOTBALL_BASE_URL || "https://v3.football.api-sports.io";

if (!API_KEY) {
  console.warn("API_FOOTBALL_KEY is not set");
}

type SupabaseClient = Awaited<ReturnType<typeof createAdminClient>>;

async function fetchFromApi(endpoint: string, params: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  console.log(`[API-Football] Fetching ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": API_KEY!,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API-Football error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getCachedData(supabase: SupabaseClient, key: string) {
  const { data } = await supabase
    .from("provider_cache")
    .select("data, expires_at")
    .eq("key", key)
    .single();

  if (data && new Date(data.expires_at) > new Date()) {
    return data.data;
  }
  return null;
}

async function setCachedData(supabase: SupabaseClient, key: string, data: any, durationSeconds: number) {
  const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
  await supabase.from("provider_cache").upsert({
    key,
    data,
    expires_at: expiresAt,
  }, { onConflict: "key" });
}

export async function syncCompetitions(season: string) {
  const supabase = createAdminClient();
  const cacheKey = `competitions_${season}`;
  
  let data = await getCachedData(supabase, cacheKey);
  let fromCache = true;

  if (!data) {
    fromCache = false;
    const response = await fetchFromApi("/leagues", { season });
    data = response.response;
    await setCachedData(supabase, cacheKey, data, 7 * 24 * 60 * 60); // 7 days
  }

  const competitions = [];
  const items = Array.isArray(data) ? data : [];
  
  console.log(`[Sync] Competitions: Received ${items.length} items (Cache: ${fromCache})`);

  for (const item of items) {
    const { league, country } = item;
    
    if (!league.id) continue;

    const { data: upserted, error } = await supabase.from("competitions").upsert({
      provider: "api_football",
      provider_competition_id: league.id.toString(),
      name: league.name,
      country: country.name,
      season: season,
      is_active: league.active,
    }, { 
      onConflict: "provider,provider_competition_id,season" 
    }).select().single();
    
    if (error) {
      console.error(`[Sync] Error upserting competition ${league.name}:`, error);
    } else if (upserted) {
      competitions.push(upserted);
    }
  }
  
  console.log(`[Sync] Competitions: Successfully upserted ${competitions.length} competitions`);
  return competitions;
}

export async function syncTeams(competitionId: string, season: string) {
  const supabase = createAdminClient();
  
  // Get provider_competition_id
  const { data: comp } = await supabase.from("competitions").select("provider_competition_id").eq("id", competitionId).single();
  if (!comp?.provider_competition_id) throw new Error("Competition not linked to provider");

  const cacheKey = `teams_${comp.provider_competition_id}_${season}`;
  let data = await getCachedData(supabase, cacheKey);
  
  if (!data) {
    const response = await fetchFromApi("/teams", { league: comp.provider_competition_id, season });
    data = response.response;
    await setCachedData(supabase, cacheKey, data, 7 * 24 * 60 * 60); // 7 days
  }

  const teams = [];
  const items = Array.isArray(data) ? data : [];

  for (const item of items) {
    const { team } = item;
    
    const { data: upserted, error } = await supabase.from("teams").upsert({
      provider: "api_football",
      provider_team_id: team.id.toString(),
      name: team.name,
      country: team.country,
      logo_url: team.logo,
    }, { onConflict: "provider_team_id" }).select().single();
    
    if (error) {
      console.error(`[Sync] Error upserting team ${team.name}:`, error);
    } else if (upserted) {
      teams.push(upserted);
    }
  }
  
  return teams;
}

export async function syncFixtures(competitionId: string, season: string, from?: string, to?: string) {
  const supabase = createAdminClient();
  
  const { data: comp } = await supabase.from("competitions").select("provider_competition_id").eq("id", competitionId).single();
  if (!comp?.provider_competition_id) throw new Error("Competition not linked to provider");

  // Cache key includes dates if provided
  const cacheKey = `fixtures_${comp.provider_competition_id}_${season}_${from || 'all'}_${to || 'all'}`;
  let data = await getCachedData(supabase, cacheKey);
  
  if (!data) {
    const params: Record<string, string> = { league: comp.provider_competition_id, season };
    if (from) params.from = from;
    if (to) params.to = to;
    
    const response = await fetchFromApi("/fixtures", params);
    data = response.response;
    await setCachedData(supabase, cacheKey, data, 6 * 60 * 60); // 6 hours
  }

  const fixtures = [];
  const items = Array.isArray(data) ? data : [];

  for (const item of items) {
    const { fixture, teams, goals, score } = item;
    
    // Resolve team IDs
    const { data: homeTeam } = await supabase.from("teams").select("id").eq("provider_team_id", teams.home.id.toString()).single();
    const { data: awayTeam } = await supabase.from("teams").select("id").eq("provider_team_id", teams.away.id.toString()).single();
    
    if (!homeTeam || !awayTeam) continue; // Skip if teams not found (should sync teams first)

    const status = fixture.status.short === "FT" ? "finished" : 
                   fixture.status.short === "1H" || fixture.status.short === "2H" || fixture.status.short === "HT" ? "live" : "scheduled";

    const { data: upserted, error } = await supabase.from("matches").upsert({
      provider: "api_football",
      provider_fixture_id: fixture.id.toString(),
      competition_id: competitionId,
      season: season,
      home_team_id: homeTeam.id,
      away_team_id: awayTeam.id,
      kickoff_at: fixture.date,
      venue: fixture.venue.name,
      status: status,
      home_score: goals.home,
      away_score: goals.away,
      ht_home_score: score.halftime.home,
      ht_away_score: score.halftime.away,
    }, { onConflict: "provider_fixture_id" }).select().single();
    
    if (error) {
      console.error(`[Sync] Error upserting fixture ${fixture.id}:`, error);
    } else if (upserted) {
      fixtures.push(upserted);
    }
  }
  
  return fixtures;
}

export async function syncLineups(fixtureId: string) {
  const supabase = createAdminClient();
  
  const { data: match } = await supabase.from("matches").select("*").eq("id", fixtureId).single();
  if (!match?.provider_fixture_id) throw new Error("Match not linked to provider");

  const cacheKey = `lineups_${match.provider_fixture_id}`;
  let data = await getCachedData(supabase, cacheKey);
  
  if (!data) {
    const response = await fetchFromApi("/fixtures/lineups", { fixture: match.provider_fixture_id });
    data = response.response;
    
    const isFinished = match.status === "finished";
    await setCachedData(supabase, cacheKey, data, isFinished ? 30 * 24 * 60 * 60 : 60 * 60); // 30 days or 1 hour
  }

  if (!data || data.length === 0) return { status: "pending" };

  // Clear existing lineups for this match
  await supabase.from("lineup_positions").delete().eq("match_id", fixtureId);

  for (const teamLineup of (data as any[])) {
    const providerTeamId = teamLineup.team.id.toString();
    const { data: team } = await supabase.from("teams").select("id").eq("provider_team_id", providerTeamId).single();
    if (!team) continue;

    for (const playerItem of teamLineup.startXI) {
      const { player } = playerItem;
      
      // Find or create player
      let playerId = await findOrCreatePlayer(supabase, player);
      
      if (playerId) {
        const { x, y } = mapGridToCoordinates(player.grid);

        await supabase.from("lineup_positions").insert({
          match_id: fixtureId,
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
  const { data: byId } = await supabase.from("players").select("id").eq("provider_player_id", apiPlayer.id.toString()).single();
  if (byId) return byId.id;

  // 2. Try Name
  const { data: byName } = await supabase.from("players").select("id").ilike("name", apiPlayer.name).limit(1).single();
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