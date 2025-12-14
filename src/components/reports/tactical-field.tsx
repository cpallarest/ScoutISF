"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PlayerMarker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  dorsal: string;
  name: string;
}

interface TacticalFieldProps {
  data: any;
  matchId?: string;
  onSave: (data: any) => void;
}

export function TacticalField({ data, matchId, onSave }: TacticalFieldProps) {
  const [homePlayers, setHomePlayers] = useState<PlayerMarker[]>(data.lineup_data?.home || []);
  const [awayPlayers, setAwayPlayers] = useState<PlayerMarker[]>(data.lineup_data?.away || []);
  const [activeTab, setActiveTab] = useState("home");
  const [syncing, setSyncing] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const players = activeTab === "home" ? homePlayers : awayPlayers;
  const setPlayers = activeTab === "home" ? setHomePlayers : setAwayPlayers;

  useEffect(() => {
    if (matchId && homePlayers.length === 0 && awayPlayers.length === 0) {
      syncLineups();
    }
  }, [matchId]);

  const syncLineups = async () => {
    if (!matchId) return;
    setSyncing(true);
    try {
      // 1. Call Sync API
      const res = await fetch(`/api/sync/lineups?fixtureId=${matchId}`);
      if (!res.ok) throw new Error("Sync failed");
      
      // 2. Fetch from DB
      const { data: positions } = await supabase
        .from("lineup_positions")
        .select("*, player:players(name)")
        .eq("match_id", matchId);

      if (positions && positions.length > 0) {
        // Map to PlayerMarker
        const newHomePlayers: PlayerMarker[] = [];
        const newAwayPlayers: PlayerMarker[] = [];

        // We need to know which team is home/away.
        // We can fetch match details or assume based on team_id if we had it.
        // But lineup_positions has team_id.
        // We need to know match's home_team_id and away_team_id.
        const { data: match } = await supabase.from("matches").select("home_team_id, away_team_id").eq("id", matchId).single();
        
        if (match) {
          positions.forEach((pos: any) => {
            const marker: PlayerMarker = {
              id: pos.player_id, // Use player_id as ID so we can link back
              x: pos.x || 50,
              y: pos.y || 50,
              dorsal: pos.shirt_number?.toString() || "",
              name: pos.player?.name || "Unknown"
            };

            if (pos.team_id === match.home_team_id) {
              newHomePlayers.push(marker);
            } else if (pos.team_id === match.away_team_id) {
              newAwayPlayers.push(marker);
            }
          });

          setHomePlayers(newHomePlayers);
          setAwayPlayers(newAwayPlayers);
          toast({ title: "Success", description: "Lineups synced successfully" });
        }
      } else {
        toast({ title: "Info", description: "No lineups found for this match yet" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to sync lineups", variant: "destructive" });
    }
    setSyncing(false);
  };

  const addPlayer = () => {
    if (players.length >= 11) return; // Limit to 11
    const newPlayer: PlayerMarker = {
      id: Math.random().toString(36).substr(2, 9),
      x: 50,
      y: 50,
      dorsal: "",
      name: ""
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (id: string, field: keyof PlayerMarker, value: any) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSave = () => {
    onSave({ home: homePlayers, away: awayPlayers });
  };


  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Clamp values
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      updatePlayer(draggingId, "x", clampedX);
      updatePlayer(draggingId, "y", clampedY);
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="space-y-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="home">Home Team</TabsTrigger>
            <TabsTrigger value="away">Away Team</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-4">
            {matchId && (
              <Button variant="outline" size="sm" onClick={syncLineups} disabled={syncing}>
                {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sync Lineups
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{players.length}/11 Players</span>
            <Button onClick={addPlayer} size="sm" disabled={players.length >= 11}>
              <Plus className="mr-2 h-4 w-4" /> Add Player
            </Button>
          </div>
        </div>

        <div 
          ref={fieldRef}
          className="relative w-full aspect-[16/9] bg-green-900 rounded-lg overflow-hidden border-2 border-white/10 select-none shadow-inner"
          onMouseMove={handleMouseMove}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "10% 10%"
          }}
        >
          {/* Pitch Markings */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          {/* Goals */}
          <div className="absolute top-1/2 left-0 w-8 h-24 border-2 border-l-0 border-white/20 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-1/2 right-0 w-8 h-24 border-2 border-r-0 border-white/20 -translate-y-1/2 pointer-events-none"></div>

          {players.map((player) => (
            <div
              key={player.id}
              className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-move group z-10"
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              onMouseDown={(e) => handleMouseDown(player.id, e)}
            >
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg border-2 border-white relative hover:scale-110 transition-transform">
                <input 
                  className="w-full h-full bg-transparent text-center outline-none cursor-move font-mono"
                  value={player.dorsal}
                  onChange={(e) => updatePlayer(player.id, "dorsal", e.target.value)}
                  placeholder="#"
                  maxLength={2}
                />
                <button 
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  onClick={(e) => { e.stopPropagation(); removePlayer(player.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input 
                className="mt-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded text-center w-24 outline-none border-none backdrop-blur-sm"
                value={player.name}
                onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
                placeholder="Player Name"
              />
            </div>
          ))}
        </div>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Next: Player Evaluation</Button>
      </div>
    </div>
  );
}
