"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  Shield,
  Users,
  Sparkles,
  Shirt,
  GripVertical,
  RotateCcw,
  Check,
  Move,
} from "lucide-react";

export const TacticalBoard: React.FC = () => {
  const {
    activeMatch,
    players,
    subs,
    tacticalLineups,
    updateTacticalSlot,
    setFormation,
    teamSettings,
  } = useTeamHub();

  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragSourceSlot, setDragSourceSlot] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);

  if (!activeMatch) return null;

  const lineup = tacticalLineups[activeMatch.id] || {
    formation: "2-3-1",
    positions: {},
  };

  // Get all confirmed players and confirmed subs
  const confirmedPlayers = players.filter(
    (p) => activeMatch.rsvps[p.id]?.status === "yes"
  );
  const confirmedSubs = subs.filter((s) =>
    activeMatch.subsConfirmed.includes(s.id)
  );

  const availableSquad = [
    ...confirmedPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      number: p.number,
      gender: p.gender,
      isSub: false,
      positions: p.preferredPositions,
    })),
    ...confirmedSubs.map((s) => ({
      id: s.id,
      name: `${s.name} (Sub)`,
      number: undefined,
      gender: s.gender,
      isSub: true,
      positions: s.positions,
    })),
  ];

  // Assigned IDs
  const assignedIds = Object.values(lineup.positions).filter(Boolean);
  const benchSquad = availableSquad.filter((p) => !assignedIds.includes(p.id));

  // Count women on the field in current lineup
  const womenOnPitch = assignedIds.filter((id) => {
    const p = availableSquad.find((item) => item.id === id);
    return p?.gender === "female";
  }).length;

  // 7v7 Formations: 2-3-1, 3-2-1, 2-2-2
  const slotDefinitions: Record<
    "2-3-1" | "3-2-1" | "2-2-2",
    { id: string; label: string; x: number; y: number }[]
  > = {
    "2-3-1": [
      { id: "GK", label: "GK", x: 50, y: 88 },
      { id: "DEF_L", label: "LCB", x: 30, y: 70 },
      { id: "DEF_R", label: "RCB", x: 70, y: 70 },
      { id: "MID_L", label: "LM", x: 20, y: 44 },
      { id: "MID_C", label: "CM", x: 50, y: 46 },
      { id: "MID_R", label: "RM", x: 80, y: 44 },
      { id: "FWD", label: "ST", x: 50, y: 20 },
    ],
    "3-2-1": [
      { id: "GK", label: "GK", x: 50, y: 88 },
      { id: "DEF_L", label: "LB", x: 22, y: 70 },
      { id: "DEF_C", label: "CB", x: 50, y: 72 },
      { id: "DEF_R", label: "RB", x: 78, y: 70 },
      { id: "MID_L", label: "LCM", x: 35, y: 45 },
      { id: "MID_R", label: "RCM", x: 65, y: 45 },
      { id: "FWD", label: "ST", x: 50, y: 20 },
    ],
    "2-2-2": [
      { id: "GK", label: "GK", x: 50, y: 88 },
      { id: "DEF_L", label: "LCB", x: 32, y: 72 },
      { id: "DEF_R", label: "RCB", x: 68, y: 72 },
      { id: "MID_L", label: "LCM", x: 35, y: 46 },
      { id: "MID_R", label: "RCM", x: 65, y: 46 },
      { id: "FWD_L", label: "LF", x: 35, y: 22 },
      { id: "FWD_R", label: "RF", x: 65, y: 22 },
    ],
  };

  const currentSlots = slotDefinitions[lineup.formation] || slotDefinitions["2-3-1"];

  // Drag & Drop Handlers
  const handleDragStartFromBench = (e: React.DragEvent, playerId: string) => {
    e.dataTransfer.setData("text/plain", playerId);
    e.dataTransfer.setData("source", "bench");
    setDraggedPlayerId(playerId);
    setDragSourceSlot(null);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartFromSlot = (
    e: React.DragEvent,
    slotId: string,
    playerId: string
  ) => {
    e.dataTransfer.setData("text/plain", playerId);
    e.dataTransfer.setData("source", slotId);
    setDraggedPlayerId(playerId);
    setDragSourceSlot(slotId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (activeDropTarget !== targetId) {
      setActiveDropTarget(targetId);
    }
  };

  const handleDropOnSlot = (e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    setActiveDropTarget(null);
    const playerId = e.dataTransfer.getData("text/plain") || draggedPlayerId;
    const source = e.dataTransfer.getData("source") || dragSourceSlot;

    if (!playerId) return;

    const currentOccupant = lineup.positions[targetSlotId];

    if (source && source !== "bench") {
      // Swapping positions between slots on the pitch
      updateTacticalSlot(activeMatch.id, source, currentOccupant || "");
      updateTacticalSlot(activeMatch.id, targetSlotId, playerId);
    } else {
      // Placing from bench onto pitch slot
      updateTacticalSlot(activeMatch.id, targetSlotId, playerId);
    }

    setDraggedPlayerId(null);
    setDragSourceSlot(null);
  };

  const handleDropOnBench = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropTarget(null);
    const source = e.dataTransfer.getData("source") || dragSourceSlot;

    if (source && source !== "bench") {
      // Remove player from that pitch slot back to bench
      updateTacticalSlot(activeMatch.id, source, "");
    }

    setDraggedPlayerId(null);
    setDragSourceSlot(null);
  };

  const handleClearLineup = () => {
    currentSlots.forEach((slot) => {
      updateTacticalSlot(activeMatch.id, slot.id, "");
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Drag & Drop Lineup
            </div>
            <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {teamSettings.format} Starting Lineup
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Drag players from the bench onto positions on the pitch, or drag between slots to swap positions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Formation Picker */}
            <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 p-1.5 border border-zinc-800 text-xs">
              <span className="font-semibold text-zinc-400 pl-2">Formation:</span>
              {(["2-3-1", "3-2-1", "2-2-2"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormation(activeMatch.id, fmt)}
                  className={`rounded-xl px-3 py-1.5 font-bold transition ${
                    lineup.formation === fmt
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Clear Board Button */}
            <button
              onClick={handleClearLineup}
              title="Clear current lineup to bench"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Pitch Co-ed Rule Check */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-950/70 p-4 border border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300">
              NYC Footy On-Field Rule:
            </span>
            <span
              className={`text-xs font-bold rounded px-2 py-0.5 flex items-center gap-1.5 ${
                womenOnPitch >= 2
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
              }`}
            >
              {womenOnPitch >= 2 ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Move className="h-3.5 w-3.5" />
              )}
              {womenOnPitch} / 2 Women on Pitch
            </span>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>{assignedIds.length} on pitch</span>
            <span className="text-zinc-600">•</span>
            <span>{benchSquad.length} on bench</span>
          </div>
        </div>
      </div>

      {/* Soccer Pitch Graphic with Drag & Drop Targets */}
      <div className="mx-auto max-w-3xl">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-3xl border-4 border-emerald-900/60 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 p-4 shadow-2xl overflow-hidden">
          {/* Turf Stripes Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,#000_40px,#000_80px)]" />

          {/* Pitch Markings */}
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white/40" />
          <div className="pointer-events-none absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-white/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
          <div className="pointer-events-none absolute left-1/2 top-4 h-24 w-48 -translate-x-1/2 border-b-2 border-l-2 border-r-2 border-white/40 rounded-b-xl" />
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-24 w-48 -translate-x-1/2 border-t-2 border-l-2 border-r-2 border-white/40 rounded-t-xl" />
          <div className="pointer-events-none absolute bottom-12 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60" />

          {/* Player Position Slots (Drop Targets + Draggable Jerseys) */}
          {currentSlots.map((slot) => {
            const assignedPlayerId = lineup.positions[slot.id];
            const assignedPlayer = availableSquad.find(
              (p) => p.id === assignedPlayerId
            );
            const isDropHovered = activeDropTarget === slot.id;
            const isCurrentlyDragged =
              draggedPlayerId === assignedPlayerId && dragSourceSlot === slot.id;

            return (
              <div
                key={slot.id}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={() => {
                  if (activeDropTarget === slot.id) setActiveDropTarget(null);
                }}
                onDrop={(e) => handleDropOnSlot(e, slot.id)}
                className={`absolute z-10 flex flex-col items-center select-none transition-all duration-200 ${
                  isDropHovered ? "scale-125 z-30" : ""
                }`}
              >
                {/* Jersey Badge - Draggable if occupied */}
                <div
                  draggable={!!assignedPlayer}
                  onDragStart={(e) => {
                    if (assignedPlayer) {
                      handleDragStartFromSlot(e, slot.id, assignedPlayer.id);
                    }
                  }}
                  onDragEnd={() => {
                    setDraggedPlayerId(null);
                    setDragSourceSlot(null);
                    setActiveDropTarget(null);
                  }}
                  className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-2xl transition-all duration-200 border-2 cursor-pointer ${
                    isCurrentlyDragged ? "opacity-40 scale-95" : ""
                  } ${
                    isDropHovered
                      ? "ring-4 ring-emerald-300 bg-emerald-400 text-zinc-950 border-white scale-110 shadow-emerald-500/50"
                      : assignedPlayer
                      ? assignedPlayer.gender === "female"
                        ? "bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400/50 cursor-grab active:cursor-grabbing hover:scale-105"
                        : "bg-emerald-500 text-zinc-950 border-white ring-2 ring-emerald-300/50 cursor-grab active:cursor-grabbing hover:scale-105"
                      : "bg-zinc-950/80 border-dashed border-white/50 text-white/70 backdrop-blur-sm hover:border-emerald-400 hover:bg-zinc-900"
                  }`}
                  title={
                    assignedPlayer
                      ? `${assignedPlayer.name} - Drag to swap or bench`
                      : `Drop player here for ${slot.label}`
                  }
                >
                  <Shirt className="h-7 w-7 sm:h-8 sm:w-8" />
                  <span className="absolute text-[11px] sm:text-xs font-black">
                    {assignedPlayer?.number
                      ? `#${assignedPlayer.number}`
                      : slot.label}
                  </span>

                  {/* Drag indicator icon if occupied */}
                  {assignedPlayer && (
                    <div className="absolute -top-1.5 -right-1.5 rounded-full bg-zinc-900/90 p-0.5 text-zinc-300 border border-zinc-700 shadow">
                      <Move className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>

                {/* Slot Label & Player Selector / Drop Prompt */}
                <div className="mt-1.5">
                  {isDropHovered ? (
                    <span className="rounded-md bg-emerald-400 px-2 py-0.5 text-[10px] font-black text-zinc-950 shadow-lg">
                      Drop here
                    </span>
                  ) : (
                    <select
                      value={assignedPlayerId || ""}
                      onChange={(e) =>
                        updateTacticalSlot(activeMatch.id, slot.id, e.target.value)
                      }
                      className="rounded-lg bg-zinc-950/90 px-2 py-1 text-[11px] font-bold text-white border border-zinc-700 shadow-lg backdrop-blur-md focus:border-emerald-400 focus:outline-none max-w-[110px] truncate"
                    >
                      <option value="">-- {slot.label} --</option>
                      {availableSquad.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} {player.gender === "female" ? "(F)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes Bench - Also acts as a Drop Zone to bench players! */}
      <div
        onDragOver={(e) => handleDragOver(e, "bench")}
        onDragLeave={() => {
          if (activeDropTarget === "bench") setActiveDropTarget(null);
        }}
        onDrop={handleDropOnBench}
        className={`rounded-3xl border transition-all p-6 shadow-xl backdrop-blur-md ${
          activeDropTarget === "bench"
            ? "border-emerald-400 bg-emerald-950/40 ring-4 ring-emerald-500/30"
            : "border-zinc-800 bg-zinc-900/80"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <h4 className="text-base font-bold text-white">
              Substitutes Bench ({benchSquad.length})
            </h4>
          </div>
          <div className="text-xs text-zinc-400">
            {activeDropTarget === "bench" ? (
              <span className="text-emerald-300 font-bold animate-pulse">
                Drop here to bench player!
              </span>
            ) : (
              <span>Drag any player onto a pitch position above</span>
            )}
          </div>
        </div>

        {/* Bench Cards */}
        <div className="mt-4 flex flex-wrap gap-3">
          {benchSquad.length === 0 ? (
            <div className="text-xs text-zinc-500 py-3 italic">
              All confirmed players are on the field! Drag a player here from the pitch to bench them.
            </div>
          ) : (
            benchSquad.map((player) => {
              const isCurrentlyDragged = draggedPlayerId === player.id;
              return (
                <div
                  key={player.id}
                  draggable
                  onDragStart={(e) => handleDragStartFromBench(e, player.id)}
                  onDragEnd={() => {
                    setDraggedPlayerId(null);
                    setDragSourceSlot(null);
                    setActiveDropTarget(null);
                  }}
                  className={`flex items-center gap-2.5 rounded-2xl bg-zinc-950 border px-3.5 py-2 text-xs cursor-grab active:cursor-grabbing select-none transition-all shadow-md group ${
                    isCurrentlyDragged
                      ? "opacity-40 border-dashed border-emerald-400 scale-95"
                      : "border-zinc-800 hover:border-emerald-500/70 hover:bg-zinc-900 hover:scale-105"
                  }`}
                  title="Drag and drop onto a pitch position slot"
                >
                  <GripVertical className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition" />
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg font-black text-[10px] ${
                      player.gender === "female"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {player.gender === "female" ? "F" : "M"}
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-emerald-300 transition">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Pos: {player.positions.join(", ")}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
