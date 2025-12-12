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

interface Player {
  id: string;
  name: string;
  position: string | null;
  nationality: string | null;
  dob: string | null;
  foot: string | null;
}

interface PlayersTableProps {
  players: Player[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Foot</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No players found.
              </TableCell>
            </TableRow>
          ) : (
            players.map((player) => (
              <TableRow key={player.id} className="border-border hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.position || "-"}</TableCell>
                <TableCell>{player.nationality || "-"}</TableCell>
                <TableCell>{player.foot || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
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
