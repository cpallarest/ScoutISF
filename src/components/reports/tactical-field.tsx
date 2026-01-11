"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerMarker {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  dorsal: string;
  name: string;
}

interface TacticalFieldProps {
  data: any;
  matchId?: string; // ya no se usa para sync, pero lo dejamos por compatibilidad
  onSave: (data: any) => void;
}

export function TacticalField({ data, matchId, onSave }: TacticalFieldProps) {
  const [homePlayers, setHomePlayers] = useState<PlayerMarker[]>(
    data?.lineup_data?.home || [],
  );
  const [awayPlayers, setAwayPlayers] = useState<PlayerMarker[]>(
    data?.lineup_data?.away || [],
  );
  const [activeTab, setActiveTab] = useState<"home" | "away">("home");

  const fieldRef = useRef<HTMLDivElement>(null);

  // Arrastre robusto: guardamos el id en ref para evitar “lags” por renders
  const draggingIdRef = useRef<string | null>(null);

  const players = activeTab === "home" ? homePlayers : awayPlayers;
  const setPlayers = activeTab === "home" ? setHomePlayers : setAwayPlayers;

  const addPlayer = () => {
    if (players.length >= 11) return;
    const newPlayer: PlayerMarker = {
      id: Math.random().toString(36).slice(2, 9),
      x: 50,
      y: 50,
      dorsal: "",
      name: "",
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (id: string, field: keyof PlayerMarker, value: any) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    onSave({ home: homePlayers, away: awayPlayers });
  };

  // ✅ IMPORTANTE: capturamos el puntero en el CAMPO (fieldRef),
  // porque el onPointerMove está en el campo.
  const startDrag = (id: string, e: React.PointerEvent) => {
    draggingIdRef.current = id;

    if (fieldRef.current) {
      fieldRef.current.setPointerCapture(e.pointerId);
    }

    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const draggingId = draggingIdRef.current;
    if (!draggingId || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    // Actualiza SOLO el equipo activo (home o away) porque arrastras en su pestaña
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === draggingId ? { ...p, x: clampedX, y: clampedY } : p,
      ),
    );
  };

  const endDrag = (e: React.PointerEvent) => {
    draggingIdRef.current = null;

    if (fieldRef.current) {
      try {
        fieldRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // si no había capture activo, no pasa nada
      }
    }
  };

  const homeCount = useMemo(() => homePlayers.length, [homePlayers.length]);
  const awayCount = useMemo(() => awayPlayers.length, [awayPlayers.length]);
  const currentCount = activeTab === "home" ? homeCount : awayCount;

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "home" | "away")}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="home">Home Team</TabsTrigger>
            <TabsTrigger value="away">Away Team</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentCount}/11 Players
            </span>
            <Button onClick={addPlayer} size="sm" disabled={currentCount >= 11}>
              <Plus className="mr-2 h-4 w-4" /> Add Player
            </Button>
          </div>
        </div>

        <TabsContent value="home" className="mt-0">
          <Pitch
            fieldRef={fieldRef}
            players={homePlayers}
            onStartDrag={startDrag}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            updatePlayer={updatePlayer}
            removePlayer={removePlayer}
          />
        </TabsContent>

        <TabsContent value="away" className="mt-0">
          <Pitch
            fieldRef={fieldRef}
            players={awayPlayers}
            onStartDrag={startDrag}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            updatePlayer={updatePlayer}
            removePlayer={removePlayer}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Next: Player Evaluation</Button>
      </div>
    </div>
  );
}

interface PitchProps {
  fieldRef: React.RefObject<HTMLDivElement>;
  players: PlayerMarker[];
  onStartDrag: (id: string, e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  updatePlayer: (id: string, field: keyof PlayerMarker, value: any) => void;
  removePlayer: (id: string) => void;
}

function Pitch({
  fieldRef,
  players,
  onStartDrag,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  updatePlayer,
  removePlayer,
}: PitchProps) {
  return (
    <div
      ref={fieldRef}
      className="relative w-full aspect-[16/9] bg-green-900 rounded-lg overflow-hidden border-2 border-white/10 select-none shadow-inner"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        // 🔥 esto es clave en móviles/trackpad para que no “secuestren” el gesto
        touchAction: "none",
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "10% 10%",
      }}
    >
      {/* Pitch Markings */}
      <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Goals */}
      <div className="absolute top-1/2 left-0 w-8 h-24 border-2 border-l-0 border-white/20 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-8 h-24 border-2 border-r-0 border-white/20 -translate-y-1/2 pointer-events-none" />

      {players.map((player) => (
        <div
          key={player.id}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-move group z-10"
          style={{ left: `${player.x}%`, top: `${player.y}%` }}
          onPointerDown={(e) => onStartDrag(player.id, e)}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg border-2 border-white relative hover:scale-110 transition-transform">
            <input
              className="w-full h-full bg-transparent text-center outline-none cursor-move font-mono text-xs sm:text-base"
              value={player.dorsal}
              onChange={(e) =>
                updatePlayer(player.id, "dorsal", e.target.value)
              }
              placeholder="#"
              maxLength={2}
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                removePlayer(player.id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>

          <input
            className="mt-1 bg-black/60 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded text-center w-20 sm:w-24 outline-none border-none backdrop-blur-sm"
            value={player.name}
            onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
            placeholder="Player Name"
          />
        </div>
      ))}
    </div>
  );
}
