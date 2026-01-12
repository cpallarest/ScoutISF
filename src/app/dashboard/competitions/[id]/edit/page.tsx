import { createClient } from "@/supabase/server";
import { redirect, notFound } from "next/navigation";
import { CompetitionEditForm } from "@/components/competitions/competition-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditCompetitionPage({
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

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/competitions/${competition.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          Edit Competition
        </h1>
      </div>

      <div className="max-w-2xl">
        <CompetitionEditForm competition={competition} />
      </div>
    </div>
  );
}
