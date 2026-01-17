"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FeaturedFieldEditorProps {
  fieldId: string;
  onPlayerAdded: () => void;
}

export default function FeaturedFieldEditor({
  fieldId,
  onPlayerAdded,
}: FeaturedFieldEditorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const searchPlayers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      const { data } = await supabase
        .from("players")
        .select("id, name, position, team:teams(name)")
        .ilike("name", `%${query}%`)
        .limit(10);

      if (data) setResults(data);
    };

    const debounce = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const addPlayer = async (playerId: string) => {
    // Default position (center)
    const { error } = await supabase.from("featured_field_players").insert({
      field_id: fieldId,
      player_id: playerId,
      x: 50,
      y: 50,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding player",
        description: error.message,
      });
    } else {
      toast({
        title: "Player added",
        description: "Player added to the field",
      });
      setOpen(false);
      onPlayerAdded();
    }
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-muted-foreground">
            <Search className="mr-2 h-4 w-4" />
            Search and add players...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search by name..." 
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>No players found.</CommandEmpty>
              <CommandGroup heading="Results">
                {results.map((player) => (
                  <CommandItem
                    key={player.id}
                    onSelect={() => addPlayer(player.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{player.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {player.position} • {player.team?.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
