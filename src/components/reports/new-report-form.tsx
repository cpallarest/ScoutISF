"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function NewReportForm() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("2023"); // plan Free: 2021–2023
  const [selectedFixture, setSelectedFixture] = useState<string>("");

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    setSelectedCompetition("");
    setSelectedFixture("");
    setFixtures([]);
    fetchCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  useEffect(() => {
    if (selectedCompetition && selectedSeason) {
      fetchFixtures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompetition, selectedSeason]);

  const fetchCompetitions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .eq("provider", "api_football")
      .eq("season", selectedSeason)
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setCompetitions([]);
    } else {
      setCompetitions(data ?? []);
    }

    setLoading(false);
  };

  const syncCompetitions = async () => {
    setSyncing(true);
    try {
      const res = await fetch(
        `/api/sync/competitions?season=${selectedSeason}`,
      );
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Sync failed");
      }

      await fetchCompetitions();

      toast({
        title: "Success",
        description: `Competitions synced (${json?.count ?? "?"})`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sync competitions",
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  const fetchFixtures = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("matches")
      .select("*, home_team:home_team_id(name), away_team:away_team_id(name)")
      .eq("competition_id", selectedCompetition)
      .eq("season", selectedSeason)
      .order("kickoff_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setFixtures([]);
    } else {
      setFixtures(data ?? []);
    }

    setLoading(false);
  };

  const syncFixtures = async () => {
    if (!selectedCompetition) return;

    setSyncing(true);
    try {
      const res = await fetch(
        `/api/sync/fixtures?competitionId=${selectedCompetition}&season=${selectedSeason}`,
      );
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Sync failed");
      }

      await fetchFixtures();

      toast({
        title: "Success",
        description: `Fixtures synced (${json?.count ?? "?"})`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to sync fixtures",
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  const createReport = async () => {
    if (!selectedFixture || selectedFixture === "none") return;

    setLoading(true);

    const fixture = fixtures.find((f) => f.id === selectedFixture);
    if (!fixture) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Selected fixture not found.",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      setLoading(false);
      toast({
        title: "Error",
        description: "You must be signed in.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        match_id: fixture.id,
        match_date: fixture.kickoff_at,
        home_team_id: fixture.home_team_id,
        away_team_id: fixture.away_team_id,
        competition_id: fixture.competition_id,
        home_score: fixture.home_score ?? 0,
        away_score: fixture.away_score ?? 0,
        halftime_home_score: fixture.ht_home_score ?? 0,
        halftime_away_score: fixture.ht_away_score ?? 0,
        venue: fixture.venue,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    fetch(`/api/sync/lineups?fixtureId=${fixture.id}`).catch(() => {});
    router.push(`/dashboard/reports/${data.id}/edit`);
  };

  const seasonOptions = ["2023", "2022", "2021"];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Report</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Select Season" />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                {seasonOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Competition</Label>
            <div className="flex gap-2">
              <Select
                value={selectedCompetition}
                onValueChange={setSelectedCompetition}
                disabled={loading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={loading ? "Loading..." : "Select Competition"}
                  />
                </SelectTrigger>

                <SelectContent className="max-h-72 overflow-y-auto">
                  {competitions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No competitions found
                    </SelectItem>
                  ) : (
                    competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name} ({comp.country})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={syncCompetitions}
                disabled={syncing}
                title="Sync competitions"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {selectedCompetition && selectedCompetition !== "none" && (
          <div className="space-y-2">
            <Label>Fixture</Label>
            <div className="flex gap-2">
              <Select
                value={selectedFixture}
                onValueChange={setSelectedFixture}
                disabled={loading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={loading ? "Loading..." : "Select Match"}
                  />
                </SelectTrigger>

                <SelectContent className="max-h-72 overflow-y-auto">
                  {fixtures.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No fixtures found
                    </SelectItem>
                  ) : (
                    fixtures.map((fixture) => (
                      <SelectItem key={fixture.id} value={fixture.id}>
                        {new Date(fixture.kickoff_at).toLocaleDateString()} —{" "}
                        {fixture.home_team?.name} vs {fixture.away_team?.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={syncFixtures}
                disabled={syncing || !selectedCompetition}
                title="Sync fixtures"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={createReport}
          disabled={!selectedFixture || selectedFixture === "none" || loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Report
        </Button>
      </CardContent>
    </Card>
  );
}
