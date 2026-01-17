"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import FeaturedPitch from "@/components/featured/featured-pitch";
import FeaturedFieldEditor from "@/components/featured/featured-field-editor";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditFeaturedFieldClientProps {
  field: any;
  initialPlayers: any[];
}

export default function EditFeaturedFieldClient({
  field,
  initialPlayers,
}: EditFeaturedFieldClientProps) {
  const [currentField, setCurrentField] = useState(field);
  const [players, setPlayers] = useState(initialPlayers);
  const [name, setName] = useState(field.name);
  const [system, setSystem] = useState(field.system);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("featured_field_players")
      .select(`
        id, x, y, note,
        player:players (id, name, position, nationality)
      `)
      .eq("field_id", field.id);
    
    if (data) setPlayers(data);
  };

  const saveChanges = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("featured_fields")
      .update({ name, system })
      .eq("id", field.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: error.message,
      });
    } else {
      toast({
        title: "Changes saved",
      });
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Edit Field</h1>
            <p className="text-sm text-muted-foreground">Drag players to position them</p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Field Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tactical System</label>
             <Select
                value={system}
                onValueChange={setSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-3-3">4-3-3</SelectItem>
                  <SelectItem value="4-4-2">4-4-2</SelectItem>
                  <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                  <SelectItem value="3-5-2">3-5-2</SelectItem>
                  <SelectItem value="3-4-3">3-4-3</SelectItem>
                  <SelectItem value="5-3-2">5-3-2</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Players</label>
            <FeaturedFieldEditor 
              fieldId={field.id} 
              onPlayerAdded={fetchPlayers} 
            />
          </div>
        </div>

        <div className="lg:col-span-3 bg-card rounded-lg p-6 border">
          <FeaturedPitch 
            fieldId={field.id}
            system={system}
            initialPlayers={players}
          />
        </div>
      </div>
    </div>
  );
}
