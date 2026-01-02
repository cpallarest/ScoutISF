import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlayerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: player, error } = await supabase
    .from("players")
    .select(`
      *,
      team:teams (
        id,
        name
      )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error("[PlayerDetailPage] supabase error:", error);
  }

  if (!player) return notFound();

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            {player.name}
          </h1>
          <p className="text-muted-foreground mt-1">Player details</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/players">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/players/${player.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Current Team</div>
            <div className="font-medium">
              {player.team ? (
                <Link 
                  href={`/dashboard/teams/${player.team.id}`}
                  className="text-primary hover:underline"
                >
                  {player.team.name}
                </Link>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Position</div>
            <div className="font-medium">{player.position ?? "-"}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Nationality</div>
            <div className="font-medium">{player.nationality ?? "-"}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Dominant foot</div>
            <div className="font-medium">{player.foot ?? "-"}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">Date of birth</div>
            <div className="font-medium">
              {player.dob
                ? new Date(player.dob).toISOString().slice(0, 10)
                : "-"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
