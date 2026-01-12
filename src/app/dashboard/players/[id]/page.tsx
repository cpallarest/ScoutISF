import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlayerPageProps {
  params: { id: string };
}

function formatDateDMY(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // ================= PLAYER =================
  const { data: player } = await supabase
    .from("players")
    .select(
      `
      id,
      name,
      position,
      nationality,
      dob,
      team:teams(id, name)
    `,
    )
    .eq("id", params.id)
    .single();

  if (!player) notFound();

  const teamData = Array.isArray(player.team) ? player.team[0] : player.team;

  // ================= REPORTS FOR PLAYER =================
  // NOTA: No ordenamos por created_at para evitar errores si no existe.
  // Si quieres orden por fecha, lo hacemos en el cliente después o añadimos created_at.
  const { data: reportPlayers, error: rpError } = await supabase
    .from("report_players")
    .select(
      `
      id,
      grade,
      verdict,
      comment,
      report:reports(
        id,
        match_date,
        home_team:teams!reports_home_team_id_fkey(name),
        away_team:teams!reports_away_team_id_fkey(name),
        competition:competitions(name)
      )
    `,
    )
    .eq("player_id", player.id);

  const reports = Array.isArray(reportPlayers) ? reportPlayers : [];

  // Ordenar en servidor puede ser delicado por joins; lo hacemos aquí:
  reports.sort((a: any, b: any) => {
    const ad = a?.report?.match_date
      ? new Date(a.report.match_date).getTime()
      : 0;
    const bd = b?.report?.match_date
      ? new Date(b.report.match_date).getTime()
      : 0;
    return bd - ad;
  });

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>

          <div className="mt-2 text-muted-foreground space-y-1">
            {player.position ? <div>Position: {player.position}</div> : null}
            {player.nationality ? (
              <div>Nationality: {player.nationality}</div>
            ) : null}
            {player.dob ? <div>DOB: {formatDateDMY(player.dob)}</div> : null}

            {teamData ? (
              <div>
                Team:{" "}
                <Link
                  className="underline"
                  href={`/dashboard/teams/${teamData.id}`}
                >
                  {teamData.name}
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <Button asChild>
          <Link href={`/dashboard/players/${player.id}/edit`}>Edit Player</Link>
        </Button>
      </div>

      {/* REPORTS */}
      <Card>
        <CardHeader>
          <CardTitle>Scouting Reports</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {rpError ? (
            <div className="text-sm text-destructive">
              Error loading reports: {rpError.message}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground">
              No scouting reports available for this player.
            </p>
          ) : (
            reports.map((rp: any) => {
              const reportId = rp?.report?.id;
              const compName = rp?.report?.competition?.name ?? "Competition";
              const matchDate = rp?.report?.match_date ?? null;
              const homeTeam = rp?.report?.home_team?.name ?? "Unknown";
              const awayTeam = rp?.report?.away_team?.name ?? "Unknown";

              return (
                <div key={rp.id} className="border rounded-md p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                    <div className="font-semibold text-lg">
                      {homeTeam} vs {awayTeam}
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-4 text-sm text-muted-foreground">
                    <div className="font-medium">{compName}</div>
                    <div>{formatDateDMY(matchDate)}</div>
                  </div>

                  <div className="flex gap-4 text-sm pt-2">
                    <span>
                      <strong>Grade:</strong> {rp.grade ?? "-"}
                    </span>
                    <span>
                      <strong>Verdict:</strong> {rp.verdict ?? "-"}
                    </span>
                  </div>

                  {rp.comment ? (
                    <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                      {rp.comment}
                    </div>
                  ) : null}

                  {reportId ? (
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/reports/${reportId}`}>
                          View Report
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
