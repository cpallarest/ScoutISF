"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2 } from "lucide-react";
import { CreatePlayerDialog } from "@/components/players/create-player-dialog";

interface PlayerEvaluationProps {
  reportId: string;
  onComplete: () => void;
}

export function PlayerEvaluation({
  reportId,
  onComplete,
}: PlayerEvaluationProps) {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchEvaluations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("report_players")
      .select("*, player:players(*)")
      .eq("report_id", reportId);

    setEvaluations(data || []);
    setLoading(false);
  };

  const searchPlayers = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from("players")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(5);

    setSearchResults(data || []);
    setIsSearching(false);
  };

  const addPlayerToReport = async (player: any) => {
    // evitar duplicados
    if (evaluations.some((e) => e.player_id === player.id)) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from("report_players")
      .insert({
        report_id: reportId,
        player_id: player.id,
        position_in_match: "",
        grade: null,
        verdict: null,
        comment: "",
      })
      .select("*, player:players(*)")
      .single();

    if (data) {
      setEvaluations((prev) => [...prev, data]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const updateEvaluation = async (id: string, field: string, value: any) => {
    // optimistic
    setEvaluations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );

    await supabase
      .from("report_players")
      .update({ [field]: value })
      .eq("id", id);
  };

  const removeEvaluation = async (id: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("report_players").delete().eq("id", id);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1 relative">
          <Label>Add Player</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search player by name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => searchPlayers(e.target.value)}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md mt-1 z-50 shadow-lg">
              {searchResults.map((player) => (
                <div
                  key={player.id}
                  className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                  onClick={() => addPlayerToReport(player)}
                >
                  <span>{player.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {player.position || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreatePlayerDialog onPlayerCreated={addPlayerToReport} />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Player</TableHead>
              <TableHead className="w-[80px]">Pos</TableHead>
              <TableHead className="w-[100px]">Grade</TableHead>
              <TableHead className="w-[150px]">Verdict</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : evaluations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No players evaluated yet. Add players to start evaluating.
                </TableCell>
              </TableRow>
            ) : (
              evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    {evaluation.player?.name || "Unknown"}
                    <div className="text-xs text-muted-foreground">
                      {evaluation.player?.position || "-"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      className="h-8"
                      value={evaluation.position_in_match || ""}
                      onChange={(e) =>
                        updateEvaluation(
                          evaluation.id,
                          "position_in_match",
                          e.target.value,
                        )
                      }
                      placeholder="Pos"
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      value={evaluation.grade || ""}
                      onValueChange={(val) =>
                        updateEvaluation(evaluation.id, "grade", val)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D"].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={evaluation.verdict || ""}
                      onValueChange={(val) =>
                        updateEvaluation(evaluation.id, "verdict", val)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Descartar", "Seguir", "Interesante", "Fichar"].map(
                          (v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Textarea
                      className="min-h-[60px] resize-none"
                      placeholder="Add comments..."
                      value={evaluation.comment || ""}
                      onChange={(e) =>
                        updateEvaluation(
                          evaluation.id,
                          "comment",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvaluation(evaluation.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={onComplete}>Finish Report</Button>
      </div>
    </div>
  );
}
