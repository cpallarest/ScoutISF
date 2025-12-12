import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  match_date: string;
  home_team: { name: string } | null;
  away_team: { name: string } | null;
  competition: { name: string } | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
}

interface RecentReportsTableProps {
  reports: Report[];
}

export function RecentReportsTable({ reports }: RecentReportsTableProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Competition</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No reports found. Create your first report!
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id} className="border-border hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(report.match_date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {report.home_team?.name || "Unknown"} <span className="text-muted-foreground">vs</span> {report.away_team?.name || "Unknown"}
                </TableCell>
                <TableCell className="text-muted-foreground">{report.competition?.name || "-"}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`font-mono ${
                      (report.home_score ?? 0) > (report.away_score ?? 0) 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : (report.home_score ?? 0) < (report.away_score ?? 0)
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {report.home_score ?? 0} - {report.away_score ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/reports/${report.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/reports/${report.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
