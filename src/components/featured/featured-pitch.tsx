"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  x: number;
  y: number;
  note?: string;
  player: {
    id: string;
    name: string;
    position: string;
    nationality: string;
  };
}

interface FeaturedPitchProps {
  fieldId: string;
  system: string;
  initialPlayers: Player[];
}

export default function FeaturedPitch({
  fieldId,
  system,
  initialPlayers,
}: FeaturedPitchProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  const handleDragStart = (playerId: string) => {
    setDraggingPlayer(playerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingPlayer || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === draggingPlayer ? { ...p, x, y } : p
      )
    );

    const { error } = await supabase
      .from("featured_field_players")
      .update({ x, y })
      .eq("id", draggingPlayer);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating position",
        description: error.message,
      });
      // Revert on error could be implemented here
    }

    setDraggingPlayer(null);
  };

  const removePlayer = async (id: string) => {
    const { error } = await supabase
      .from("featured_field_players")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error removing player",
        description: error.message,
      });
      return;
    }

    setPlayers((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Player removed",
    });
  };

  return (
    <div className="relative aspect-[3/4] w-full max-w-[600px] mx-auto">
      {/* Pitch Background */}
      <div
        ref={pitchRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="absolute inset-0 bg-gradient-to-b from-[#1E3A2C] to-[#2A4D3A] rounded-lg border-2 border-white/20 shadow-xl overflow-hidden"
      >
        {/* Pitch Markings */}
        <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none">
          {/* Halfway Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          {/* Penalty Areas */}
          <div className="absolute top-0 left-1/2 w-64 h-32 border-b-2 border-x-2 border-white/20 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-64 h-32 border-t-2 border-x-2 border-white/20 -translate-x-1/2" />
          {/* Goal Areas */}
          <div className="absolute top-0 left-1/2 w-24 h-12 border-b-2 border-x-2 border-white/20 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-24 h-12 border-t-2 border-x-2 border-white/20 -translate-x-1/2" />
        </div>

        {/* Players */}
        {players.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => handleDragStart(p.id)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move group"
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-transform hover:scale-110",
                  "bg-[#00D9FF] text-[#0F1419]"
                )}
              >
                {/* Use first letter of position or number if available, defaulting to initials */}
                {p.player.position.slice(0, 2).toUpperCase()}
              </div>
              <div className="mt-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded whitespace-nowrap">
                {p.player.name}
              </div>
              
              {/* Delete Button (visible on hover) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePlayer(p.id);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
