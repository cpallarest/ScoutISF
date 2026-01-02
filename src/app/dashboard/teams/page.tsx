import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TeamsTable } from "@/components/teams/teams-table";

import { CreateTeamDialog } from "@/components/teams/create-team-dialog";

export default async function TeamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: teams } = await supabase.from("teams").select("*").order("name");

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">Manage teams database</p>
        </div>
        <CreateTeamDialog />
      </div>

      <TeamsTable teams={teams as any || []} />
    </div>
  );
}
