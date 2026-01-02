"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type Team = {
  id: string;
  name: string;
  country: string | null;
};

type Player = {
  id: string;
  name: string;
  dob: string | null;
  nationality: string | null;
  foot: string | null;
  position: string | null;
  team_id: string | null;
};

interface PlayerEditFormProps {
  player: Player;
  teams?: Team[]; // opcional, por si el server page ya los trae
}

export function PlayerEditForm({
  player,
  teams: teamsProp,
}: PlayerEditFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(player.name ?? "");
  const [dob, setDob] = useState(player.dob ?? "");
  const [nationality, setNationality] = useState(player.nationality ?? "");
  const [foot, setFoot] = useState<string>(player.foot ?? "");
  const [position, setPosition] = useState(player.position ?? "");
  const [teamId, setTeamId] = useState<string>(player.team_id ?? "none");

  const [teams, setTeams] = useState<Team[]>(teamsProp ?? []);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    // si no vienen por props, los cargamos
    if (teamsProp && teamsProp.length) return;

    const loadTeams = async () => {
      setLoadingTeams(true);
      const { data, error } = await supabase
        .from("teams")
        .select("id,name,country")
        .order("name");

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setTeams([]);
      } else {
        setTeams((data as Team[]) ?? []);
      }
      setLoadingTeams(false);
    };

    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teamOptions = useMemo(() => teams ?? [], [teams]);

  const onSave = async () => {
    setSaving(true);

    const payload = {
      name: name.trim(),
      dob: dob ? dob : null,
      nationality: nationality.trim() ? nationality.trim() : null,
      foot: foot ? foot : null,
      position: position.trim() ? position.trim() : null,
      team_id: teamId === "none" ? null : teamId,
    };

    const { error } = await supabase
      .from("players")
      .update(payload)
      .eq("id", player.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    toast({ title: "Saved", description: "Player updated successfully" });
    setSaving(false);

    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Full name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date of birth</Label>
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Nationality</Label>
          <Input
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Position</Label>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. CM / RW / GK"
          />
        </div>

        <div className="space-y-2">
          <Label>Dominant foot</Label>
          <Select value={foot} onValueChange={setFoot}>
            <SelectTrigger>
              <SelectValue placeholder="Select foot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Right">Right</SelectItem>
              <SelectItem value="Left">Left</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Team</Label>
        <Select
          value={teamId}
          onValueChange={setTeamId}
          disabled={loadingTeams}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loadingTeams ? "Loading..." : "Select team"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-[320px] overflow-y-auto">
            <SelectItem value="none">No team</SelectItem>
            {teamOptions.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
                {t.country ? ` (${t.country})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving || !name.trim()}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
