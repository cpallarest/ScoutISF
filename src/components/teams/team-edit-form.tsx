"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  country: string | null;
  logo_url: string | null;
}

interface TeamEditFormProps {
  team: Team;
}

export function TeamEditForm({ team }: TeamEditFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      country: formData.get("country") as string,
      logo_url: formData.get("logo_url") as string,
    };

    const { error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", team.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Team updated successfully",
    });

    router.refresh();
    router.push(`/dashboard/teams/${team.id}`);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Team Details</CardTitle>
        <CardDescription>
          Update team information in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={team.name}
              required
              placeholder="e.g. Real Madrid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              defaultValue={team.country || ""}
              placeholder="e.g. Spain"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              defaultValue={team.logo_url || ""}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
