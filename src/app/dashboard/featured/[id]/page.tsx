import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import EditFeaturedFieldClient from "@/components/featured/edit-featured-field-client";

export default async function EditFeaturedFieldPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { id } = params;

  const { data: field } = await supabase
    .from("featured_fields")
    .select("*")
    .eq("id", id)
    .single();

  if (!field) {
    notFound();
  }

  const { data: players } = await supabase
    .from("featured_field_players")
    .select(`
      id, x, y, note,
      player:players (id, name, position, nationality)
    `)
    .eq("field_id", id);

  return <EditFeaturedFieldClient field={field} initialPlayers={players || []} />;
}
