"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedSeason, setSelectedSeason] = useState<string>("2023"); // Default to 2023 for now
  const [selectedFixture, setSelectedFixture] = useState<string>("");
  
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompetition && selectedSeason) {
      fetchFixtures();
    }
  }, [selectedCompetition, selectedSeason]);

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data } = await supabase.from("competitions").select("*").eq("is_active", true).order("name");
    if (data) setCompetitions(data);
    setLoading(false);
  };

  const syncCompetitions = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/sync/competitions?season=${selectedSeason}`);
      if (!res.ok) throw new Error("Sync failed");
      await fetchCompetitions();
      toast({ title: "Success", description: "Competitions synced successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to sync competitions", variant: "destructive" });
    }
    setSyncing(false);
  };

  const fetchFixtures = async () => {
    setLoading(true);
    // Fetch from DB first
    const { data } = await supabase
      .from("matches")
      .select("*, home_team:home_team_id(name), away_team:away_team_id(name)")
      .eq("competition_id", selectedCompetition)
      .eq("season", selectedSeason)
      .order("kickoff_at", { ascending: false });
      
    if (data) setFixtures(data);
    setLoading(false);
  };

  const syncFixtures = async () => {
    if (!selectedCompetition) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/sync/fixtures?competitionId=${selectedCompetition}&season=${selectedSeason}`);
      if (!res.ok) throw new Error("Sync failed");
      await fetchFixtures();
      toast({ title: "Success", description: "Fixtures synced successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to sync fixtures", variant: "destructive" });
    }
    setSyncing(false);
  };

  const createReport = async () => {
    if (!selectedFixture) return;
    
    setLoading(true);
    const fixture = fixtures.find(f => f.id === selectedFixture);
    if (!fixture) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create report with data from fixture
    const { data, error } = await supabase.from("reports").insert({
      user_id: user.id,
      match_id: fixture.id,
      match_date: fixture.kickoff_at,
      home_team_id: fixture.home_team_id,
      away_team_id: fixture.away_team_id,
      competition_id: fixture.competition_id,
      home_score: fixture.home_score || 0,
      away_score: fixture.away_score || 0,
      halftime_home_score: fixture.ht_home_score || 0,
      halftime_away_score: fixture.ht_away_score || 0,
      venue: fixture.venue,
      status: "draft"
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Try to sync lineups in background
    fetch(`/api/sync/lineups?fixtureId=${fixture.id}`);

    router.push(`/dashboard/reports/${data.id}/edit`);
  };

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
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Competition</Label>
            <div className="flex gap-2">
              <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>{comp.name} ({comp.country})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={syncCompetitions} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {selectedCompetition && (
          <div className="space-y-2">
            <Label>Fixture</Label>
            <div className="flex gap-2">
              <Select value={selectedFixture} onValueChange={setSelectedFixture}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select Match" />
                </SelectTrigger>
                <SelectContent>
                  {fixtures.length === 0 ? (
                    <SelectItem value="none" disabled>No fixtures found</SelectItem>
                  ) : (
                    fixtures.map(fixture => (
                      <SelectItem key={fixture.id} value={fixture.id}>
                        {new Date(fixture.kickoff_at).toLocaleDateString()} - {fixture.home_team?.name} vs {fixture.away_team?.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={syncFixtures} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        )}

        <Button className="w-full" onClick={createReport} disabled={!selectedFixture || loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Report
        </Button>
      </CardContent>
    </Card>
  );
}
