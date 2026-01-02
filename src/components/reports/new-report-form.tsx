"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2 } from "lucide-react";

  type CompetitionRow = {
  id: string;
  name: string;
  country: string | null;
  season: string | null;
  is_allowed?: boolean | null;
};

type FixtureRow = {
  id: string;
  kickoff_at: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
  ht_home_score: number | null;
  ht_away_score: number | null;
  venue: string | null;
  competition_id: string | null;
  season: string | null;
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
};

export function NewReportForm() {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [loadingCompetitions, setLoadingCompetitions] = useState(false);
  const [creatingCompetition, setCreatingCompetition] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState<string>("25/26");
  const [competitions, setCompetitions] = useState<CompetitionRow[]>([]);
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);

  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedFixture, setSelectedFixture] = useState<string>("");

  // Buscador + alta “al vuelo”
  const [competitionQuery, setCompetitionQuery] = useState("");
  const [competitionCountry, setCompetitionCountry] = useState("");

  const seasonOptions = ["25/26", "24/25", "23/24", "22/23", "21/22"];

  // --- helpers ---
  const normalize = (s: string) => (s || "").trim().toLowerCase();

  const fetchCompetitions = async () => {
    setLoadingCompetitions(true);

    const { data, error } = await supabase
      .from("competitions")
      .select("id,name,country,season,is_allowed")
      .eq("season", selectedSeason)
      .eq("is_allowed", true)
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setCompetitions([]);
    } else {
      setCompetitions((data as any) ?? []);
    }

    setLoadingCompetitions(false);
  };

  const fetchFixtures = async () => {
    if (!selectedCompetition) return;

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
      setFixtures((data as any) ?? []);
    }

    setLoading(false);
  };

  // --- create competition on the fly ---
  const createCompetitionNow = async () => {
    const name = competitionQuery.trim();
    if (!name) return;

    setCreatingCompetition(true);

    try {
      // Comprobación rápida: si ya existe por nombre+season, la usamos
      const existing = competitions.find(
        (c) => normalize(c.name) === normalize(name),
      );

      if (existing) {
        setSelectedCompetition(existing.id);
        toast({
          title: "Info",
          description: "Competition already exists. Selected.",
        });
        setCreatingCompetition(false);
        return;
      }

      const payload: any = {
        name,
        season: selectedSeason,
        country: competitionCountry.trim() || null,
        is_allowed: true,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("competitions")
        .insert(payload)
        .select("id,name,country,season,is_allowed")
        .single();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setCreatingCompetition(false);
        return;
      }

      const created = data as any as CompetitionRow;
      setCompetitions((prev) => {
        const next = [created, ...prev];
        // ordena por nombre
        next.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        return next;
      });

      setSelectedCompetition(created.id);
      setCompetitionQuery("");
      setCompetitionCountry("");

      toast({
        title: "Success",
        description: "Competition created and selected",
      });
    } finally {
      setCreatingCompetition(false);
    }
  };

  // --- create reports ---
  const createManualReport = async () => {
    if (!selectedCompetition || !selectedSeason) return;

    setLoading(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const nowIso = new Date().toISOString();

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          competition_id: selectedCompetition,
          match_date: nowIso,
          status: "draft",
          // Nullify match specific fields
          match_id: null,
          home_team_id: null,
          away_team_id: null,
          home_score: null,
          away_score: null,
          halftime_home_score: null,
          halftime_away_score: null,
          venue: null,
        })
        .select("id")
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
    } finally {
      setLoading(false);
    }
  };

  const createFromFixture = async () => {
    if (!selectedFixture) return;

    setLoading(true);

    try {
      const fixture = fixtures.find((f) => f.id === selectedFixture);
      if (!fixture) {
        toast({
          title: "Error",
          description: "Selected fixture not found.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        toast({
          title: "Error",
          description: "You must be signed in.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          match_id: fixture.id,
          match_date: fixture.kickoff_at ?? new Date().toISOString(),
          competition_id: fixture.competition_id,
          home_team_id: fixture.home_team_id,
          away_team_id: fixture.away_team_id,
          home_score: fixture.home_score,
          away_score: fixture.away_score,
          halftime_home_score: fixture.ht_home_score,
          halftime_away_score: fixture.ht_away_score,
          venue: fixture.venue,
          status: "draft",
        })
        .select("id")
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
    } finally {
      setLoading(false);
    }
  };

  // --- derived lists ---
  const filteredCompetitions = useMemo(() => {
    const q = normalize(competitionQuery);
    if (!q) return competitions;
    return competitions.filter((c) => normalize(c.name).includes(q));
  }, [competitions, competitionQuery]);

  // --- effects ---
  useEffect(() => {
    // reset al cambiar temporada
    setSelectedCompetition("");
    setSelectedFixture("");
    setFixtures([]);
    fetchCompetitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  useEffect(() => {
    setSelectedFixture("");
    setFixtures([]);
    if (selectedCompetition) fetchFixtures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompetition]);

  // --- UI state ---
  const canManual = !!selectedSeason && !!selectedCompetition && !loading;
  const canFixture = !!selectedFixture && !!selectedCompetition && !loading;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Report</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Row 1: Season + Competition */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
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

            {/* Search input to filter or create */}
            <div className="space-y-2">
              <Input
                value={competitionQuery}
                onChange={(e) => setCompetitionQuery(e.target.value)}
                placeholder="Type to search or add new..."
                disabled={loadingCompetitions}
              />

              {/* Optional country input */}
              {competitionQuery && (
                <Input
                  value={competitionCountry}
                  onChange={(e) => setCompetitionCountry(e.target.value)}
                  placeholder="Country (optional) for new competitions"
                  className="text-sm"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Select
                value={selectedCompetition}
                onValueChange={setSelectedCompetition}
                disabled={loadingCompetitions}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={loadingCompetitions ? "Loading…" : "Select competition"}
                  />
                </SelectTrigger>

                <SelectContent className="max-h-72 overflow-y-auto">
                  {filteredCompetitions.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No competitions found
                    </SelectItem>
                  ) : (
                    filteredCompetitions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        {c.country ? ` (${c.country})` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="secondary"
                onClick={createCompetitionNow}
                disabled={!competitionQuery.trim() || creatingCompetition}
                title="Create competition"
              >
                {creatingCompetition ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Loader2 className="mr-2 h-4 w-4 opacity-0" />
                )}
                Add
              </Button>
            </div>

            {competitionQuery && (
              <p className="text-xs text-muted-foreground mt-1">
                Select from dropdown OR click <b>Add</b> to create "{competitionQuery}".
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Fixture (optional) */}
        <div className="space-y-2">
          <Label>Fixture (optional)</Label>
          <div className="flex gap-2">
            <Select
              value={selectedFixture}
              onValueChange={setSelectedFixture}
              disabled={!selectedCompetition || loading}
            >
              <SelectTrigger className="flex-1">
                <SelectValue
                  placeholder={
                    !selectedCompetition
                      ? "Select competition first"
                      : loading
                        ? "Loading…"
                        : "Select match (optional)"
                  }
                />
              </SelectTrigger>

              <SelectContent className="max-h-72 overflow-y-auto">
                {fixtures.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No fixtures found (manual is fine)
                  </SelectItem>
                ) : (
                  fixtures.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.kickoff_at
                        ? new Date(f.kickoff_at).toLocaleDateString("es-ES")
                        : "—"}{" "}
                      — {f.home_team?.name ?? "Home"} vs{" "}
                      {f.away_team?.name ?? "Away"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            className="w-full"
            onClick={createManualReport}
            disabled={!canManual}
            variant="secondary"
          >
            {loading && !selectedFixture ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Manual Report
          </Button>

          <Button
            className="w-full"
            onClick={createFromFixture}
            disabled={!canFixture}
          >
            {loading && selectedFixture ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create From Fixture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
