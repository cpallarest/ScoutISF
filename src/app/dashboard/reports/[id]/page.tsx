import { createClient } from "../../../../../supabase/server";
import { Button } from "@/components/ui/button";
import { FileDown, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ReportViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: report } = await supabase.from("reports").select(`
    *,
    home_team:teams!reports_home_team_id_fkey(*),
    away_team:teams!reports_away_team_id_fkey(*),
    competition:competitions(*),
    report_players(*, player:players(*))
  `).eq("id", params.id).single();

  if (!report) return <div>Report not found</div>;

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/reports"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              {report.home_team?.name} vs {report.away_team?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date(report.match_date).toLocaleDateString()} • {report.competition?.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/reports/${report.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/reports/${report.id}/print`} target="_blank">
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold text-xl">{report.home_score} - {report.away_score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Competition</span>
              <span>{report.competition?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Season</span>
              <span>{report.competition?.season}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                {report.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tactical Lineup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] bg-green-900 rounded-lg relative overflow-hidden border border-white/10 shadow-inner"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "10% 10%"
              }}
            >
               {/* Pitch Markings */}
               <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none"></div>
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none"></div>
               <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               
               {report.lineup_data && (report.lineup_data as any[]).map((p: any) => (
                 <div 
                   key={p.id}
                   className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                   style={{ left: `${p.x}%`, top: `${p.y}%` }}
                 >
                   <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border border-white shadow-sm">
                     {p.dorsal}
                   </div>
                   <div className="mt-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded text-center backdrop-blur-sm">
                     {p.name}
                   </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.report_players.map((rp: any) => (
                <TableRow key={rp.id}>
                  <TableCell className="font-medium">
                    {rp.player.name}
                    <div className="text-xs text-muted-foreground">{rp.player.position}</div>
                  </TableCell>
                  <TableCell>{rp.grade || "-"}</TableCell>
                  <TableCell>
                    {rp.verdict && (
                      <Badge variant="outline" className={
                        rp.verdict === 'Fichar' ? 'bg-primary/20 text-primary border-primary/50' :
                        rp.verdict === 'Interesante' ? 'bg-secondary/20 text-secondary border-secondary/50' :
                        ''
                      }>
                        {rp.verdict}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md text-muted-foreground">{rp.comment}</TableCell>
                </TableRow>
              ))}
              {report.report_players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No players evaluated.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
