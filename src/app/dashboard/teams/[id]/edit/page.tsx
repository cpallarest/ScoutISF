import { createClient } from "@/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TeamEditForm } from "@/components/teams/team-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditTeamPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
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
        <h1 className="text-3xl font-bold font-display tracking-tight">
          Edit Team
        </h1>
      </div>

      <div className="max-w-2xl">
        <TeamEditForm team={team} />
      </div>
    </div>
  );
}
