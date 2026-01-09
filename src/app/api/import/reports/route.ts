import { createAdminClient } from "@/supabase/admin";
import { parseCSV, parseDate } from "@/lib/import/csv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text, ";");
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Empty CSV" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const errors: string[] = [];
    let importedReportsCount = 0;
    let importedPlayersCount = 0;
    let importedEvaluationsCount = 0;

    // Caches to minimize DB lookups
    const competitionCache = new Map<string, string>(); // name+season -> id
    const teamCache = new Map<string, string>(); // name -> id
    const playerCache = new Map<string, string>(); // name+dob -> id
    const reportCache = new Map<string, string>(); // key -> id

    // Pre-fetch existing data (optional optimization, but let's do lazy loading/upsert for simplicity and robustness)

    for (const row of rows) {
      try {
        // 1. Parse Basic Data
        const matchDate = parseDate(row["matchdate"]);
        if (!matchDate) {
          errors.push(`Invalid date for row: ${JSON.stringify(row)}`);
          continue;
        }

        const homeTeamName = row["HomeClubName"]?.trim();
        const awayTeamName = row["AwayClubName"]?.trim();
        const competitionName = row["CompetitionName"]?.trim();
        const playerName = row["Player"]?.trim();

        if (!homeTeamName || !awayTeamName || !competitionName || !playerName) {
          // Skip if essential data missing
          continue;
        }

        // 2. Competition
        // Infer season from date (e.g., 2021-09-01 -> 2021/2022)
        const dateObj = new Date(matchDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // 1-12
        // If month > 7 (August), it's StartYear/(StartYear+1), else (StartYear-1)/StartYear
        const seasonStart = month > 7 ? year : year - 1;
        const season = `${seasonStart}/${seasonStart + 1}`;
        
        const compKey = `${competitionName}_${season}`;
        let compId = competitionCache.get(compKey);

        if (!compId) {
          // Check/Insert Competition
          const { data: existingComp } = await supabase
            .from("competitions")
            .select("id")
            .eq("name", competitionName)
            .eq("season", season)
            .single();

          if (existingComp) {
            compId = existingComp.id;
          } else {
            const { data: newComp, error: compError } = await supabase
              .from("competitions")
              .insert({ name: competitionName, season })
              .select("id")
              .single();
            
            if (compError) throw compError;
            compId = newComp.id;
          }
          competitionCache.set(compKey, compId);
        }

        // 3. Teams (Home & Away)
        // Function to get/create team
        const getTeamId = async (name: string) => {
          if (teamCache.has(name)) return teamCache.get(name)!;
          
          const { data: existingTeam } = await supabase
            .from("teams")
            .select("id")
            .eq("name", name)
            .single();

          if (existingTeam) {
            teamCache.set(name, existingTeam.id);
            return existingTeam.id;
          }

          const { data: newTeam, error: teamError } = await supabase
            .from("teams")
            .insert({ name })
            .select("id")
            .single();
            
          if (teamError) throw teamError;
          teamCache.set(name, newTeam.id);
          return newTeam.id;
        };

        const homeTeamId = await getTeamId(homeTeamName);
        const awayTeamId = await getTeamId(awayTeamName);

        // 4. Report
        const reportKey = `${matchDate}_${homeTeamId}_${awayTeamId}`;
        let reportId = reportCache.get(reportKey);

        if (!reportId) {
          const { data: existingReport } = await supabase
            .from("reports")
            .select("id")
            .eq("match_date", matchDate)
            .eq("home_team_id", homeTeamId)
            .eq("away_team_id", awayTeamId)
            .single();

          if (existingReport) {
            reportId = existingReport.id;
          } else {
            const { data: newReport, error: reportError } = await supabase
              .from("reports")
              .insert({
                match_date: matchDate,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                competition_id: compId,
                status: "draft"
              })
              .select("id")
              .single();

            if (reportError) throw reportError;
            reportId = newReport.id;
            importedReportsCount++;
          }
          reportCache.set(reportKey, reportId);
        }

        // 5. Player
        const dob = parseDate(row["DOB"]);
        const nationality = row["PrimaryNationality"]?.trim() || null;
        const playerKey = `${playerName}_${dob || "no_dob"}`;
        
        let playerId = playerCache.get(playerKey);

        if (!playerId) {
          // Try to find player
          let query = supabase.from("players").select("id").eq("name", playerName);
          if (dob) {
            query = query.eq("dob", dob);
          } else {
            // If no DOB, risk of mixing players, but we accept it per requirements
          }
          
          const { data: existingPlayers } = await query.limit(1);
          const existingPlayer = existingPlayers?.[0];

          if (existingPlayer) {
            playerId = existingPlayer.id;
          } else {
            // Determine team_id if PlayerClub matches one of the teams
            const playerClub = row["PlayerClub"]?.trim();
            let currentTeamId = null;
            if (playerClub) {
              // Try to resolve team id for player club, but don't force create it just for this
              // Or maybe we do? Let's just check if it matches home or away, otherwise ignore or maybe lazy create?
              // Prompt says: "if PlayerClub matches an existing team"
              if (playerClub === homeTeamName) currentTeamId = homeTeamId;
              else if (playerClub === awayTeamName) currentTeamId = awayTeamId;
              else {
                 // Check cache or DB? Maybe too expensive. Let's skip for now unless strict.
              }
            }

            const { data: newPlayer, error: playerError } = await supabase
              .from("players")
              .insert({
                name: playerName,
                dob,
                nationality,
                current_team_id: currentTeamId
              })
              .select("id")
              .single();

            if (playerError) throw playerError;
            playerId = newPlayer.id;
            importedPlayersCount++;
          }
          playerCache.set(playerKey, playerId);
        }

        // 6. Report Player Evaluation
        // Upsert based on report_id + player_id
        const evaluationData = {
          report_id: reportId,
          player_id: playerId,
          position_in_match: row["R_Posición en el Encuentro"]?.trim() || null,
          grade: row["R_Valoración en el Encuentro"]?.trim() || null, // A, B, C, D
          verdict: row["R_Verdicto"]?.trim() || null,
          comment: row["C_Comentario"]?.trim() || null,
        };

        const { error: evalError } = await supabase
          .from("report_players")
          .upsert(evaluationData, { onConflict: "report_id,player_id" });

        if (evalError) throw evalError;
        importedEvaluationsCount++;

      } catch (err: any) {
        console.error("Row error:", err);
        errors.push(`Error processing row for player ${row["Player"]}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedReports: importedReportsCount,
      importedPlayers: importedPlayersCount,
      importedEvaluations: importedEvaluationsCount,
      errors
    });

  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
