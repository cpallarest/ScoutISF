"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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

interface PlayerEditFormProps {
  player: {
    id: string;
    name: string;
    dob: string | null;
    nationality: string | null;
    position: string | null;
    foot: string | null;
  };
}

export function PlayerEditForm({ player }: PlayerEditFormProps) {
  const [name, setName] = useState(player.name ?? "");
  const [dob, setDob] = useState<string>(
    player.dob ? player.dob.slice(0, 10) : "",
  );
  const [nationality, setNationality] = useState(player.nationality ?? "");
  const [position, setPosition] = useState(player.position ?? "");
  const [foot, setFoot] = useState<string>(player.foot ?? "");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("players")
      .update({
        name,
        dob: dob || null,
        nationality: nationality || null,
        position: position || null,
        foot: foot || null,
      })
      .eq("id", player.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Player updated",
      description: "Changes saved successfully.",
    });

    router.push(`/dashboard/players/${player.id}`);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto space-y-6 rounded-md border border-border bg-card p-6"
    >
      <h1 className="text-2xl font-bold tracking-tight mb-2">Edit player</h1>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of birth</Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Centre Back"
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

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/players")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
