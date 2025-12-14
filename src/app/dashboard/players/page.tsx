import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlayersTable } from "@/components/players/players-table";
import { CreatePlayerDialog } from "@/components/players/create-player-dialog";

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: players } = await supabase.from("players").select("*").order("name");

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-1">Global player database</p>
        </div>
        <CreatePlayerDialog />
      </div>

      <PlayersTable players={players as any || []} />
    </div>
  );
}
