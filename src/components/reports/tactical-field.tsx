"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PlayerMarker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  dorsal: string;
  name: string;
}

interface TacticalFieldProps {
  data: any;
  onSave: (data: any) => void;
}

export function TacticalField({ data, onSave }: TacticalFieldProps) {
  const [players, setPlayers] = useState<PlayerMarker[]>(data.lineup_data || []);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const addPlayer = () => {
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tactical Lineup</h3>
        <Button onClick={addPlayer} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Player
        </Button>
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

      <div className="flex justify-end">
        <Button onClick={() => onSave(players)}>Next: Player Evaluation</Button>
      </div>
    </div>
  );
}
