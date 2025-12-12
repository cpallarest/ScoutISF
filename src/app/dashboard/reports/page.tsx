import { createClient } from "../../../../supabase/server";
import { RecentReportsTable } from "@/components/dashboard/recent-reports-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  const { data: reports } = await supabase.from("reports").select(`
      id,
      match_date,
      home_score,
      away_score,
      status,
      home_team:teams!reports_home_team_id_fkey(name),
      away_team:teams!reports_away_team_id_fkey(name),
      competition:competitions(name)
    `).eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Manage your match reports</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      <RecentReportsTable reports={reports as any || []} />
    </div>
  );
}
