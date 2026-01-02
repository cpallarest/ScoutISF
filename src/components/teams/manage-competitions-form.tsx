"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Competition {
  id: string;
  name: string;
  country: string | null;
  season: string | null;
}

interface ManageCompetitionsFormProps {
  teamId: string;
}

export function ManageCompetitionsForm({ teamId }: ManageCompetitionsFormProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Fetch all competitions
      const { data: allComps } = await supabase
        .from("competitions")
        .select("id, name, country, season")
        .order("name");

      // 2. Fetch assigned competitions
      const { data: assigned } = await supabase
        .from("team_competitions")
        .select("competition_id")
        .eq("team_id", teamId);

      if (allComps) {
        setCompetitions(allComps);
      }
      if (assigned) {
        setAssignedIds(new Set(assigned.map((a) => a.competition_id)));
      }
      setLoading(false);
    };

    fetchData();
  }, [teamId, supabase]);

  const toggleCompetition = async (competitionId: string, currentState: boolean) => {
    const newState = !currentState;
    
    // Optimistic update
    const newAssignedIds = new Set(assignedIds);
    if (newState) {
      newAssignedIds.add(competitionId);
    } else {
      newAssignedIds.delete(competitionId);
    }
    setAssignedIds(newAssignedIds);

    try {
      if (newState) {
        const { error } = await supabase
          .from("team_competitions")
          .upsert(
            { team_id: teamId, competition_id: competitionId },
            { onConflict: "team_id,competition_id" }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("team_competitions")
          .delete()
          .eq("team_id", teamId)
          .eq("competition_id", competitionId);
        if (error) throw error;
      }
    } catch (error) {
      // Revert on error
      if (newState) {
        newAssignedIds.delete(competitionId);
      } else {
        newAssignedIds.add(competitionId);
      }
      setAssignedIds(new Set(newAssignedIds));
      
      toast({
        title: "Error",
        description: "Failed to update competition assignment",
        variant: "destructive",
      });
    }
  };

  const filteredCompetitions = competitions.filter((comp) => {
    const term = search.toLowerCase();
    return (
      comp.name.toLowerCase().includes(term) ||
      (comp.country && comp.country.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading competitions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search competitions..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredCompetitions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            No competitions found.
          </div>
        ) : (
          filteredCompetitions.map((comp) => {
            const isAssigned = assignedIds.has(comp.id);
            return (
              <Card key={comp.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-medium">{comp.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {comp.country || "Intl"} • {comp.season || "No season"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`comp-${comp.id}`} className="text-sm text-muted-foreground">
                      {isAssigned ? "Assigned" : "Unassigned"}
                    </Label>
                    <Switch
                      id={`comp-${comp.id}`}
                      checked={isAssigned}
                      onCheckedChange={() => toggleCompetition(comp.id, isAssigned)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
