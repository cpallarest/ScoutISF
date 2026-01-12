import { createClient } from "@/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PlayerEditForm } from "@/components/players/player-edit-form";

export default async function EditPlayerPage({
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

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!player) return notFound();

  return (
    <div className="container mx-auto px-6 py-8">
      <PlayerEditForm player={player} />
    </div>
  );
}
