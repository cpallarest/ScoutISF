"use client";

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
import { Eye, Edit, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

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

// 👉 helper para tener SIEMPRE el mismo formato en server y client
const formatDate = (iso: string) => {
  if (!iso) return "-";
  // Handle YYYY-MM-DD manually to avoid timezone issues and hydration mismatches
  const parts = iso.split('T')[0].split('-'); // Assuming ISO or YYYY-MM-DD
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
  }
  return iso;
};

export function RecentReportsTable({ reports }: RecentReportsTableProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este informe? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    const { error } = await supabase.from("reports").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Informe eliminado",
      description: "El informe se ha borrado correctamente.",
    });

    router.refresh();
  };

  return (
    <>
      <div className="hidden sm:block rounded-md border border-border bg-card w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[720px]">
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
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No reports found. Create your first report!
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatDate(report.match_date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.home_team?.name || "Unknown"}{" "}
                        <span className="text-muted-foreground">vs</span>{" "}
                        {report.away_team?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.competition?.name || "-"}
                      </TableCell>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/dashboard/reports/${report.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/dashboard/reports/${report.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link
                              href={`/dashboard/reports/${report.id}/print`}
                              target="_blank"
                            >
                              <Printer className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-md border border-border">
            No reports found. Create your first report!
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-card rounded-md border border-border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <div className="text-xs text-muted-foreground font-mono">
                      {formatDate(report.match_date)}
                   </div>
                   <div className="font-medium text-lg">
                      {report.home_team?.name || "Unknown"} <span className="text-muted-foreground">vs</span> {report.away_team?.name || "Unknown"}
                   </div>
                   <div className="text-sm text-muted-foreground">
                      {report.competition?.name || "-"}
                   </div>
                </div>
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
              </div>

              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/reports/${report.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/reports/${report.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Link>
                </Button>
                 <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link
                      href={`/dashboard/reports/${report.id}/print`}
                      target="_blank"
                    >
                      <Printer className="mr-2 h-4 w-4" /> PDF
                    </Link>
                  </Button>
              </div>
               <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(report.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
