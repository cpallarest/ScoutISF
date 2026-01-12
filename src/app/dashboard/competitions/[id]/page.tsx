import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
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

export default async function CompetitionDetailPage({
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

  const { data: competition, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !competition) {
    return notFound();
  }

  // Fetch teams in this competition
  const { data: competitionTeams } = await supabase
    .from("team_competitions")
    .select(`
      team:teams (
        id,
        name,
        country,
        logo_url
      )
    `)
    .eq("competition_id", competition.id);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/competitions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            {competition.name}
          </h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/competitions/${competition.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Competition
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Competition Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Country
                </span>
                <p>{competition.country || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Season
                </span>
                <p>{competition.season || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Is Allowed (Whitelisted)
                </span>
                <p>{competition.is_allowed ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!competitionTeams || competitionTeams.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No teams assigned to this competition.
                  </TableCell>
                </TableRow>
              ) : (
                competitionTeams.map((ct: any) => (
                  <TableRow key={ct.team.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {ct.team.logo_url && (
                        <img
                          src={ct.team.logo_url}
                          alt={ct.team.name}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      {ct.team.name}
                    </TableCell>
                    <TableCell>{ct.team.country || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/teams/${ct.team.id}`}>
                          View Team
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
