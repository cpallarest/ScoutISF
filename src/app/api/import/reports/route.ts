// src/app/api/import/reports/route.ts
import { createAdminClient } from "@/supabase/admin";
import { parseCSV, parseDate } from "@/lib/import/csv";
import { NextRequest, NextResponse } from "next/server";

function detectDelimiter(csvText: string): "," | ";" {
  const firstLine = (csvText.split(/\r?\n/).find((l) => l.trim().length > 0) ??
    "") as string;

  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;

  return semiCount > commaCount ? ";" : ",";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const delimiter = detectDelimiter(text);
    const rows = parseCSV(text, delimiter);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Empty CSV" }, { status: 400 });
    }

    // Guard útil: si el CSV no trae columnas esperadas, mejor decirlo claro.
    if (rows[0] && !("matchdate" in rows[0])) {
      return NextResponse.json(
        {
          error:
            "CSV columns not detected correctly (matchdate missing). Check delimiter/format.",
          detectedDelimiter: delimiter,
          sampleKeys: Object.keys(rows[0]),
        },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const errors: string[] = [];
    let importedReportsCount = 0;
    let importedPlayersCount = 0;
    let importedEvaluationsCount = 0;

    // Caches
    const competitionCache = new Map<string, string>(); // name+season -> id
    const teamCache = new Map<string, string>(); // name -> id
    const playerCache = new Map<string, string>(); // name+dob -> id
    const reportCache = new Map<string, string>(); // key -> id

    let rowIndex = 0;

    for (const row of rows) {
      rowIndex++;

      try {
        // 1) Match date
        const matchDate = parseDate(row["matchdate"]);
        if (!matchDate) {
          errors.push(
            `Invalid date for row ${rowIndex}: ${JSON.stringify(row)}`,
          );
          continue;
        }

        const homeTeamName = row["HomeClubName"]?.trim();
        const awayTeamName = row["AwayClubName"]?.trim();
        const competitionName = row["CompetitionName"]?.trim();
        const playerName = row["Player"]?.trim();

        if (!homeTeamName || !awayTeamName || !competitionName || !playerName) {
          // Fila incompleta: la saltamos
          continue;
        }

        // 2) Competition season inferred from matchDate
        const dateObj = new Date(matchDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // 1-12
        const seasonStart = month > 7 ? year : year - 1;
        const season = `${seasonStart}/${seasonStart + 1}`;

        const compKey = `${competitionName}_${season}`;
        let compId = competitionCache.get(compKey);

        if (!compId) {
          const { data: existingComp } = await supabase
            .from("competitions")
            .select("id")
            .eq("name", competitionName)
            .eq("season", season)
            .maybeSingle();

          if (existingComp?.id) {
            compId = existingComp.id;
          } else {
            const { data: newComp, error: compError } = await supabase
              .from("competitions")
              .insert({ name: competitionName, season })
              .select("id")
              .single();

            if (compError) throw compError;
            compId = newComp?.id;
          }

          if (!compId) {
            errors.push(
              `Failed to resolve competition ID for row ${rowIndex} (competition: ${competitionName})`,
            );
            continue;
          }

          competitionCache.set(compKey, compId);
        }

        // 3) Teams (upsert by name)
        const getTeamId = async (name: string): Promise<string> => {
          const cached = teamCache.get(name);
          if (cached) return cached;

          const { data: existingTeam } = await supabase
            .from("teams")
            .select("id")
            .eq("name", name)
            .maybeSingle();

          if (existingTeam?.id) {
            teamCache.set(name, existingTeam.id);
            return existingTeam.id;
          }

          const { data: newTeam, error: teamError } = await supabase
            .from("teams")
            .insert({ name })
            .select("id")
            .single();

          if (teamError) throw teamError;

          const id = newTeam?.id;
          if (!id) throw new Error(`Failed to create team: ${name}`);

          teamCache.set(name, id);
          return id;
        };

        const homeTeamId = await getTeamId(homeTeamName);
        const awayTeamId = await getTeamId(awayTeamName);

        // 4) Report (unique by match_date + home + away)
        const reportKey = `${matchDate}_${homeTeamId}_${awayTeamId}`;
        let reportId = reportCache.get(reportKey);

        if (!reportId) {
          const { data: existingReport } = await supabase
            .from("reports")
            .select("id")
            .eq("match_date", matchDate)
            .eq("home_team_id", homeTeamId)
            .eq("away_team_id", awayTeamId)
            .maybeSingle();

          if (existingReport?.id) {
            reportId = existingReport.id;
          } else {
            const { data: newReport, error: reportError } = await supabase
              .from("reports")
              .insert({
                match_date: matchDate,
                home_team_id: homeTeamId,
                away_team_id: awayTeamId,
                competition_id: compId,
                status: "draft",
              })
              .select("id")
              .single();

            if (reportError) throw reportError;
            reportId = newReport?.id;

            if (reportId) importedReportsCount++;
          }

          if (!reportId) {
            errors.push(
              `Failed to resolve reportId for row ${rowIndex} (reportKey: ${reportKey})`,
            );
            continue;
          }

          reportCache.set(reportKey, reportId);
        }

        // 5) Player (match by name + dob if dob exists; else name only)
        const dob = parseDate(row["DOB"]);
        const nationality = row["PrimaryNationality"]?.trim() || null;
        const playerKey = `${playerName}_${dob || "no_dob"}`;

        let playerId = playerCache.get(playerKey);

        if (!playerId) {
          let query = supabase
            .from("players")
            .select("id")
            .eq("name", playerName);

          if (dob) query = query.eq("dob", dob);

          const { data: existingPlayers } = await query.limit(1);
          const existingPlayer = existingPlayers?.[0];

          if (existingPlayer?.id) {
            playerId = existingPlayer.id;
          } else {
            const playerClub = row["PlayerClub"]?.trim();
            let currentTeamId: string | null = null;

            if (playerClub) {
              if (playerClub === homeTeamName) currentTeamId = homeTeamId;
              else if (playerClub === awayTeamName) currentTeamId = awayTeamId;
            }

            const { data: newPlayer, error: playerError } = await supabase
              .from("players")
              .insert({
                name: playerName,
                dob,
                nationality,
                current_team_id: currentTeamId,
              })
              .select("id")
              .single();

            if (playerError) throw playerError;

            playerId = newPlayer?.id;
            if (playerId) importedPlayersCount++;
          }

          if (!playerId) {
            errors.push(
              `Failed to resolve playerId for row ${rowIndex} (player: ${playerName})`,
            );
            continue;
          }

          playerCache.set(playerKey, playerId);
        }

        // 6) Evaluation (upsert by report_id + player_id)
        const evaluationData = {
          report_id: reportId,
          player_id: playerId,
          position_in_match: row["R_Posición en el Encuentro"]?.trim() || null,
          grade: row["R_Valoración en el Encuentro"]?.trim() || null,
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
        errors.push(
          `Error processing row ${rowIndex} for player ${row["Player"]}: ${err?.message || String(err)}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      detectedDelimiter: delimiter,
      importedReports: importedReportsCount,
      importedPlayers: importedPlayersCount,
      importedEvaluations: importedEvaluationsCount,
      errors,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
