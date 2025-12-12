import { createClient } from "../../../supabase/server";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { RecentReportsTable } from "@/components/dashboard/recent-reports-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch stats
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: monthlyReports },
    { count: totalReports },
    { count: flaggedPlayers },
    { data: recentReports }
  ] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact", head: true }).gte("created_at", firstDayOfMonth).eq("user_id", user.id),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("report_players").select("id", { count: "exact", head: true }).in("verdict", ["Interesante", "Fichar"]),
    supabase.from("reports").select(`
      id,
      match_date,
      home_score,
      away_score,
      status,
      home_team:teams!reports_home_team_id_fkey(name),
      away_team:teams!reports_away_team_id_fkey(name),
      competition:competitions(name)
    `).eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
  ]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.email}</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      <KPICards 
        monthlyReports={monthlyReports || 0} 
        totalReports={totalReports || 0} 
        flaggedPlayers={flaggedPlayers || 0} 
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-display">Recent Reports</h2>
        <RecentReportsTable reports={recentReports as any || []} />
      </div>
    </div>
  );
}
