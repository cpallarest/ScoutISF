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
import { Switch } from "@/components/ui/switch";

interface Competition {
  id: string;
  name: string;
  country: string | null;
  season: string | null;
  is_allowed: boolean | null;
}

interface CompetitionEditFormProps {
  competition: Competition;
}

export function CompetitionEditForm({ competition }: CompetitionEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState(competition.is_allowed || false);
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
      season: formData.get("season") as string,
      is_allowed: isAllowed,
    };

    const { error } = await supabase
      .from("competitions")
      .update(updates)
      .eq("id", competition.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update competition",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Competition updated successfully",
    });

    router.refresh();
    router.push(`/dashboard/competitions/${competition.id}`);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Competition Details</CardTitle>
        <CardDescription>
          Update competition information in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Competition Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={competition.name}
              required
              placeholder="e.g. Premier League"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={competition.country || ""}
                placeholder="e.g. England"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                name="season"
                defaultValue={competition.season || ""}
                placeholder="e.g. 2023"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_allowed"
              checked={isAllowed}
              onCheckedChange={setIsAllowed}
            />
            <Label htmlFor="is_allowed">
              Is Allowed (Visible in New Report)
            </Label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
