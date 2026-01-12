import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ManageCompetitionsForm } from "@/components/teams/manage-competitions-form";

export default async function ManageTeamCompetitionsPage({
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

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/teams/${team.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Manage Competitions
          </h1>
          <p className="text-muted-foreground">
            Assign competitions to {team.name}
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <ManageCompetitionsForm teamId={team.id} />
      </div>
    </div>
  );
}
