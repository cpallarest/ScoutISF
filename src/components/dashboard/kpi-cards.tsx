import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Flag, Activity } from "lucide-react";

interface KPICardsProps {
  monthlyReports: number;
  totalReports: number;
  flaggedPlayers: number;
}

export function KPICards({ monthlyReports, totalReports, flaggedPlayers }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Reports This Month
          </CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">{monthlyReports}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Reports
          </CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">{totalReports}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime reports created
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Flagged Players
          </CardTitle>
          <Flag className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display">{flaggedPlayers}</div>
          <p className="text-xs text-muted-foreground">
            Marked as Interesante or Fichar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
