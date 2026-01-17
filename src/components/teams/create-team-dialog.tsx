"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

type Team = {
  id: string;
  name: string;
  country: string | null;
};

interface CreateTeamDialogProps {
  /** Opcional: callback para usar el team creado/recuperado (por ejemplo desde New Report) */
  onTeamCreated?: (team: Team) => void;
}

export function CreateTeamDialog({ onTeamCreated }: CreateTeamDialogProps) {
  const supabase = createClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setName("");
    setCountry("");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      // 1) Buscar si ya existe el equipo por nombre (case-insensitive)
      const { data: existing, error: existingError } = await supabase
        .from("teams")
        .select("id, name, country")
        .ilike("name", name.trim())
        .maybeSingle();

      if (existingError) {
        console.error("Error checking existing team:", existingError);
      }

      if (existing) {
        // Ya existe → no insertamos, usamos el existente
        toast({
          title: "Team already exists",
          description: `Using existing team "${existing.name}".`,
        });

        onTeamCreated?.({
          id: existing.id,
          name: existing.name,
          country: existing.country ?? null,
        });

        setOpen(false);
        resetState();
        return;
      }

      // 2) Crear nuevo equipo
      const { data: newTeam, error } = await supabase
        .from("teams")
        .insert({
          name: name.trim(),
          country: country.trim() || null,
        })
        .select("id, name, country")
        .single();

      if (error) {
        console.error("Error creating team:", error);
        toast({
          title: "Error creating team",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (newTeam) {
        toast({
          title: "Team created",
          description: `Team "${newTeam.name}" has been created.`,
        });

        onTeamCreated?.({
          id: newTeam.id,
          name: newTeam.name,
          country: newTeam.country ?? null,
        });
      }

      setOpen(false);
      resetState();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new team</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="team-name">Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finland (Senior)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-country">Country (optional)</Label>
            <Input
              id="team-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Finland"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetState();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
