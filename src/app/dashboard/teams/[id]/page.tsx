import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TeamDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !team) {
    return notFound();
  }

  // Fetch players in this team
  const { data: players } = await supabase
    .from("players")
    .select("id, name, position, birth_date")
    .eq("team_id", team.id)
    .order("name");

  // Fetch competitions for this team
  const { data: teamCompetitions } = await supabase
    .from("team_competitions")
    .select(`
      competition:competitions (
        id,
        name,
        country,
        season
      )
    `)
    .eq("team_id", team.id);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {team.logo_url && (
              <img
                src={team.logo_url}
                alt={team.name}
                className="h-10 w-10 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold font-display tracking-tight">
              {team.name}
            </h1>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/teams/${team.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Team
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Country
                </span>
                <p>{team.country || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Competitions</CardTitle>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/teams/${team.id}/competitions`}>
                <Trophy className="mr-2 h-4 w-4" />
                Manage Competitions
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {teamCompetitions && teamCompetitions.length > 0 ? (
              <div className="space-y-2">
                {teamCompetitions.map((tc: any) => (
                  <div
                    key={tc.competition.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <Link
                        href={`/dashboard/competitions/${tc.competition.id}`}
                        className="font-medium hover:underline"
                      >
                        {tc.competition.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {tc.competition.country} • {tc.competition.season}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No competitions assigned.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Squad Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Birth Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!players || players.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No players in this team.
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>{player.position || "-"}</TableCell>
                    <TableCell>
                      {player.birth_date
                        ? new Date(player.birth_date).getFullYear()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/players/${player.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
