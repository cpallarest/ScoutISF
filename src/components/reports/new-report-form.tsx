"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function NewReportForm() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("25/26");
  const [selectedFixture, setSelectedFixture] = useState<string>("");

  // buscador de competiciones
  const [competitionQuery, setCompetitionQuery] = useState("");

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    // reset al cambiar temporada
    setSelectedCompetition("");
    setSelectedFixture("");
    setFixtures([]);
    setCompetitionQuery("");
    fetchCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  useEffect(() => {
    // al elegir competición, carga fixtures desde DB (si existen)
    if (
      selectedCompetition &&
      selectedSeason &&
      selectedCompetition !== "none"
    ) {
      fetchFixtures();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompetition, selectedSeason]);

  const fetchCompetitions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .eq("season", selectedSeason)
      .order("country", { ascending: true })
      .order("name", { ascending: true });

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

    // ya sin sync de lineups: todo manual
    router.push(`/dashboard/reports/${data.id}/edit`);
  };

  const createManualReport = async () => {
    if (!selectedCompetition || selectedCompetition === "none") return;

    setLoading(true);

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
        match_date: new Date().toISOString(),
        competition_id: selectedCompetition,
        status: "draft",
        // Manual report defaults
        home_score: 0,
        away_score: 0,
        halftime_home_score: 0,
        halftime_away_score: 0,
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

    router.push(`/dashboard/reports/${data.id}/edit`);
  };

  const seasonOptions = ["25/26", "24/25", "23/24", "22/23"];

  const filteredCompetitions = useMemo(() => {
    const q = competitionQuery.trim().toLowerCase();
    if (!q) return competitions;

    return competitions.filter((c) => {
      const name = String(c?.name ?? "").toLowerCase();
      const country = String(c?.country ?? "").toLowerCase();
      return name.includes(q) || country.includes(q);
    });
  }, [competitions, competitionQuery]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Report</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Season + Competition */}
        <div className="grid grid-cols-2 gap-4">
          {/* Season */}
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

          {/* Competition */}
          <div className="space-y-2">
            <Label>Competition</Label>

            <Input
              value={competitionQuery}
              onChange={(e) => setCompetitionQuery(e.target.value)}
              placeholder="Search by competition or country"
              className="mb-2"
            />

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
                {filteredCompetitions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No competitions found
                  </SelectItem>
                ) : (
                  filteredCompetitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.country})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fixtures + fallback manual */}
        {selectedCompetition && selectedCompetition !== "none" && (
          <div className="space-y-4">
            {/* Selector de partido si existen fixtures en tu DB */}
            <div className="space-y-2">
              <Label>Fixture</Label>
              <Select
                value={selectedFixture}
                onValueChange={setSelectedFixture}
                disabled={loading || fixtures.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      loading
                        ? "Loading..."
                        : fixtures.length === 0
                          ? "No fixtures available"
                          : "Select Match"
                    }
                  />
                </SelectTrigger>

                <SelectContent className="max-h-72 overflow-y-auto">
                  {fixtures.map((fixture) => (
                    <SelectItem key={fixture.id} value={fixture.id}>
                      {new Date(fixture.kickoff_at).toLocaleDateString()} —{" "}
                      {fixture.home_team?.name} vs {fixture.away_team?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Si NO hay fixtures, mostramos aviso + botón de informe manual */}
            {fixtures.length === 0 && !loading && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <p className="mb-3 font-medium">
                  There are no fixtures in the database for this competition and
                  season. You can still create a manual report.
                </p>
                <Button
                  variant="secondary"
                  onClick={createManualReport}
                  className="w-full border border-amber-200 bg-white hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-900 dark:hover:bg-amber-800"
                  disabled={loading}
                >
                  Create Manual Report
                </Button>
              </div>
            )}

            {/* Si hay fixtures, botón de crear report usando fixture */}
            {fixtures.length > 0 && (
              <Button
                className="w-full"
                onClick={createReport}
                disabled={
                  !selectedFixture || selectedFixture === "none" || loading
                }
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Report
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
