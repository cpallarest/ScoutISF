import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!player) return notFound();

  return (
    <div className="container mx-auto px-6 py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>{player.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position</span>
            <span>{player.position || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Nationality</span>
            <span>{player.nationality || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Date of birth</span>
            <span>
              {player.dob
                ? new Date(player.dob).toLocaleDateString("es-ES")
                : "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Foot</span>
            <span>{player.foot || "-"}</span>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/players">Back to list</Link>
            </Button>

            <Button asChild>
              <Link href={`/dashboard/players/${player.id}/edit`}>
                Edit player
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
