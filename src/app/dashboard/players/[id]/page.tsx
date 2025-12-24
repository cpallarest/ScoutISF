import { notFound, redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PlayerPageProps {
  params: { id: string };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    console.error("Error loading player:", error.message);
  }

  if (!player) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            {player.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Player profile & basic information
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/players">Back to list</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/players/${player.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground">
            General
          </h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Name:</span> {player.name}
            </p>
            <p>
              <span className="font-medium">Position:</span>{" "}
              {player.position || "-"}
            </p>
            <p>
              <span className="font-medium">Nationality:</span>{" "}
              {player.nationality || "-"}
            </p>
            <p>
              <span className="font-medium">Foot:</span> {player.foot || "-"}
            </p>
            <p>
              <span className="font-medium">Date of birth:</span>{" "}
              {player.dob ? new Date(player.dob).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4 space-y-2">
          <h2 className="font-semibold text-sm text-muted-foreground">Notes</h2>
          <p className="text-sm text-muted-foreground">
            Here you could later add scouting notes, tags, or a summary of
            reports related to this player.
          </p>
        </div>
      </div>
    </div>
  );
}
