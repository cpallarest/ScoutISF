import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";

interface Team {
  id: string;
  name: string;
  country: string | null;
}

interface TeamsTableProps {
  teams: Team[];
}

export function TeamsTable({ teams }: TeamsTableProps) {
  return (
    <>
      <div className="hidden sm:block rounded-md border border-border bg-card w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[720px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No teams found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} className="border-border hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.country || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/teams/${team.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/teams/${team.id}/edit`}>
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
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-md border border-border">
            No teams found.
          </div>
        ) : (
          teams.map((team) => (
            <div
              key={team.id}
              className="bg-card rounded-md border border-border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-lg">{team.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {team.country || "-"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/teams/${team.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/teams/${team.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
