"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  Shield,
  Users,
  Shirt,
  GripVertical,
  RotateCcw,
  Check,
  Move,
  UserCheck,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";

export const TacticalBoard: React.FC = () => {
  const {
    activeMatch,
    players,
    subs,
    tacticalLineups,
    updateTacticalSlot,
    setFormation,
  } = useTeamHub();

  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [dragSourceSlot, setDragSourceSlot] = useState<string | null>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<string | null>(null);

  // Mobile Tap-to-Assign State
  const [selectedMobilePlayerId, setSelectedMobilePlayerId] = useState<string | null>(null);

  if (!activeMatch) return null;

  const lineup = tacticalLineups[activeMatch.id] || {
    formation: "2-3-1",
    positions: {},
  };

  // Get confirmed regular squad and confirmed subs
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
      { id: "DEF_L", label: "LCB", x: 28, y: 68 },
      { id: "DEF_R", label: "RCB", x: 72, y: 68 },
      { id: "MID_L", label: "LM", x: 20, y: 44 },
      { id: "MID_C", label: "CM", x: 50, y: 46 },
      { id: "MID_R", label: "RM", x: 80, y: 44 },
      { id: "FWD", label: "ST", x: 50, y: 18 },
    ],
    "3-2-1": [
      { id: "GK", label: "GK", x: 50, y: 88 },
      { id: "DEF_L", label: "LB", x: 22, y: 68 },
      { id: "DEF_C", label: "CB", x: 50, y: 70 },
      { id: "DEF_R", label: "RB", x: 78, y: 68 },
      { id: "MID_L", label: "LCM", x: 34, y: 44 },
      { id: "MID_R", label: "RCM", x: 66, y: 44 },
      { id: "FWD", label: "ST", x: 50, y: 18 },
    ],
    "2-2-2": [
      { id: "GK", label: "GK", x: 50, y: 88 },
      { id: "DEF_L", label: "LCB", x: 30, y: 70 },
      { id: "DEF_R", label: "RCB", x: 70, y: 70 },
      { id: "MID_L", label: "LCM", x: 34, y: 45 },
      { id: "MID_R", label: "RCM", x: 66, y: 45 },
      { id: "FWD_L", label: "LF", x: 34, y: 18 },
      { id: "FWD_R", label: "RF", x: 66, y: 18 },
    ],
  };

  const currentSlots = slotDefinitions[lineup.formation] || slotDefinitions["2-3-1"];

  // Drag & Drop Handlers (Desktop Mouse)
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
      updateTacticalSlot(activeMatch.id, source, currentOccupant || "");
      updateTacticalSlot(activeMatch.id, targetSlotId, playerId);
    } else {
      updateTacticalSlot(activeMatch.id, targetSlotId, playerId);
    }
    soundFx.playPop();

    setDraggedPlayerId(null);
    setDragSourceSlot(null);
  };

  const handleDropOnBench = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDropTarget(null);
    const sourceSlot = e.dataTransfer.getData("source") || dragSourceSlot;

    if (sourceSlot && sourceSlot !== "bench") {
      updateTacticalSlot(activeMatch.id, sourceSlot, "");
      soundFx.playPop();
    }

    setDraggedPlayerId(null);
    setDragSourceSlot(null);
  };

  // Mobile Tap-to-Assign Handler
  const handleSlotClick = (slotId: string) => {
    if (selectedMobilePlayerId) {
      // Assign selected player to slot
      updateTacticalSlot(activeMatch.id, slotId, selectedMobilePlayerId);
      soundFx.playPop();
      setSelectedMobilePlayerId(null);
    } else {
      // If already has player, select them to reassign or tap again to bench
      const occupant = lineup.positions[slotId];
      if (occupant) {
        setSelectedMobilePlayerId(occupant);
        soundFx.playPop();
      }
    }
  };

  const handleClearLineup = () => {
    currentSlots.forEach((slot) => {
      updateTacticalSlot(activeMatch.id, slot.id, "");
    });
    setSelectedMobilePlayerId(null);
  };

  const selectedPlayerObj = availableSquad.find(
    (p) => p.id === selectedMobilePlayerId
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-[#00e676] text-xs font-bold border border-emerald-500/30">
                7v7
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                NYC Footy Tactical Board
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Drag & drop on desktop, or tap a player and slot on mobile to assemble the match squad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Formation Picker */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-[#090d12] p-1.5 border border-zinc-800 text-xs">
              <span className="font-semibold text-zinc-400 pl-2">Formation:</span>
              {(["2-3-1", "3-2-1", "2-2-2"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormation(activeMatch.id, fmt)}
                  className={`rounded-xl px-2.5 py-1.5 font-bold transition text-xs ${
                    lineup.formation === fmt
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
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
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#090d12] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* NYC Footy Co-ed Rule Check & Roster Balance Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#090d12]/80 p-3.5 border border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300">
              NYC Footy 7v7 Rule:
            </span>
            <span
              className={`text-xs font-bold rounded-lg px-2.5 py-1 flex items-center gap-1.5 border transition-all ${
                womenOnPitch >= 2
                  ? "bg-emerald-500/20 text-[#00e676] border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
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

          <div className="text-xs text-zinc-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-[#00e676]" />
              <strong className="text-zinc-200">{assignedIds.length}</strong> / 7 on pitch
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-zinc-200">{benchSquad.length}</strong> on bench
            </span>
          </div>
        </div>

        {/* Mobile Quick Tap-To-Assign Helper Prompt */}
        {selectedPlayerObj && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-950/60 p-2.5 border border-emerald-500/40 text-xs text-emerald-300 animate-in fade-in">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#00e676]" />
              <span>
                Selected: <strong>{selectedPlayerObj.name}</strong>. Tap any position on the pitch to assign!
              </span>
            </div>
            <button
              onClick={() => setSelectedMobilePlayerId(null)}
              className="text-[11px] underline font-bold text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Soccer Pitch Graphic with Touch/Drag Targets */}
      <div className="mx-auto max-w-2xl">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-3xl border-4 border-emerald-900/60 bg-gradient-to-b from-[#0b3323] via-[#064229] to-[#042817] p-3 sm:p-4 shadow-2xl overflow-hidden select-none">
          {/* Turf Stripes Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_32px,#000_32px,#000_64px)]" />

          {/* Pitch Markings */}
          <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-2xl border-2 border-white/40" />
          <div className="pointer-events-none absolute left-3 sm:left-4 right-3 sm:right-4 top-1/2 -translate-y-1/2 border-t-2 border-white/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 sm:h-28 sm:w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm select-none animate-subtle-bounce opacity-80" title="Kickoff Spot">
            ⚽
          </div>
          <div className="pointer-events-none absolute left-1/2 top-3 sm:top-4 h-20 w-40 sm:h-24 sm:w-48 -translate-x-1/2 border-b-2 border-l-2 border-r-2 border-white/40 rounded-b-xl" />
          <div className="pointer-events-none absolute bottom-3 sm:bottom-4 left-1/2 h-20 w-40 sm:h-24 sm:w-48 -translate-x-1/2 border-t-2 border-l-2 border-r-2 border-white/40 rounded-t-xl" />
          <div className="pointer-events-none absolute bottom-10 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60" />

          {/* Player Position Slots */}
          {currentSlots.map((slot) => {
            const assignedPlayerId = lineup.positions[slot.id];
            const assignedPlayer = availableSquad.find(
              (p) => p.id === assignedPlayerId
            );
            const isDropHovered = activeDropTarget === slot.id;
            const isCurrentlyDragged =
              draggedPlayerId === assignedPlayerId && dragSourceSlot === slot.id;
            const isTargetOfSelectedPlayer =
              selectedMobilePlayerId && assignedPlayerId !== selectedMobilePlayerId;

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
                onClick={() => handleSlotClick(slot.id)}
                className={`absolute z-10 flex flex-col items-center select-none cursor-pointer transition-all duration-200 ${
                  isDropHovered ? "scale-125 z-30" : ""
                }`}
              >
                {/* Jersey Badge */}
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
                  className={`relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl shadow-xl transition-all duration-200 border-2 ${
                    isCurrentlyDragged ? "opacity-30 scale-95" : ""
                  } ${
                    isDropHovered
                      ? "ring-4 ring-emerald-300 bg-[#00e676] text-zinc-950 border-white scale-110 shadow-emerald-500/50"
                      : assignedPlayer
                      ? assignedPlayer.gender === "female"
                        ? "bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400/50 hover:scale-105 active:scale-95"
                        : "bg-[#00e676] text-zinc-950 border-white ring-2 ring-emerald-300/50 hover:scale-105 active:scale-95 font-black"
                      : isTargetOfSelectedPlayer
                      ? "bg-emerald-950/70 border-dashed border-[#00e676] text-[#00e676] animate-pulse ring-2 ring-[#00e676]/40"
                      : "bg-[#090d12]/80 border-dashed border-white/50 text-white/70 backdrop-blur-sm hover:border-[#00e676] hover:bg-[#111823]"
                  }`}
                  title={
                    assignedPlayer
                      ? `${assignedPlayer.name} - Tap or drag to move`
                      : `Slot ${slot.label} - Tap to place player`
                  }
                >
                  <Shirt className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="absolute text-[10px] sm:text-xs font-black">
                    {assignedPlayer?.number
                      ? `#${assignedPlayer.number}`
                      : slot.label}
                  </span>

                  {assignedPlayer && (
                    <div className="absolute -top-1 -right-1 rounded-full bg-zinc-900/90 p-0.5 text-zinc-300 border border-zinc-700 shadow">
                      <Move className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>

                {/* Name Label or Drop / Tap Target Prompt */}
                <div className="mt-1">
                  {isDropHovered ? (
                    <span className="rounded-md bg-[#00e676] px-2 py-0.5 text-[9px] font-black text-zinc-950 shadow-lg">
                      Drop here
                    </span>
                  ) : assignedPlayer ? (
                    <span className="inline-block max-w-[85px] sm:max-w-[105px] truncate rounded-md bg-[#090d12]/90 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white border border-zinc-700 text-center shadow">
                      {assignedPlayer.name}
                    </span>
                  ) : (
                    <span className="rounded-md bg-zinc-950/60 px-1.5 py-0.5 text-[9px] text-zinc-400 border border-zinc-800">
                      {slot.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes Bench - Acts as Drop Zone & Mobile Tap Selector */}
      <div
        onDragOver={(e) => handleDragOver(e, "bench")}
        onDragLeave={() => {
          if (activeDropTarget === "bench") setActiveDropTarget(null);
        }}
        onDrop={handleDropOnBench}
        onClick={() => {
          if (selectedMobilePlayerId && assignedIds.includes(selectedMobilePlayerId)) {
            // If an on-pitch player was selected and bench clicked, bench them
            const slotFound = Object.entries(lineup.positions).find(
              ([slotKey, pid]) => pid === selectedMobilePlayerId && slotKey !== ""
            );
            if (slotFound) {
              updateTacticalSlot(activeMatch.id, slotFound[0], "");
              setSelectedMobilePlayerId(null);
            }
          }
        }}
        className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-xl backdrop-blur-md ${
          activeDropTarget === "bench"
            ? "border-[#00e676] bg-emerald-950/40 ring-4 ring-emerald-500/30"
            : "border-zinc-800/80 bg-[#111823]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#00e676]" />
            <h4 className="text-sm sm:text-base font-bold text-white">
              Substitutes Bench ({benchSquad.length})
            </h4>
          </div>
          <div className="text-xs text-zinc-400">
            {activeDropTarget === "bench" ? (
              <span className="text-[#00e676] font-bold animate-pulse">
                Drop here to bench player!
              </span>
            ) : (
              <span>Tap or drag any player onto a position slot above</span>
            )}
          </div>
        </div>

        {/* Bench Cards */}
        <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
          {benchSquad.length === 0 ? (
            <div className="text-xs text-zinc-400 py-3 italic">
              All confirmed players are currently placed on the field! Tap any pitch slot to bench them.
            </div>
          ) : (
            benchSquad.map((player) => {
              const isCurrentlyDragged = draggedPlayerId === player.id;
              const isSelectedOnMobile = selectedMobilePlayerId === player.id;

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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectedOnMobile) {
                      setSelectedMobilePlayerId(null);
                    } else {
                      setSelectedMobilePlayerId(player.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-2xl bg-[#090d12] border px-3 py-2 text-xs cursor-pointer select-none transition-all shadow-md group ${
                    isSelectedOnMobile
                      ? "border-[#00e676] ring-2 ring-[#00e676] bg-emerald-950/40 scale-105"
                      : isCurrentlyDragged
                      ? "opacity-30 border-dashed border-[#00e676] scale-95"
                      : "border-zinc-800 hover:border-emerald-500/70 hover:bg-zinc-900 active:scale-95"
                  }`}
                  title="Tap or drag onto pitch"
                >
                  <GripVertical className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#00e676] transition" />
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
                    <div className="font-bold text-white group-hover:text-[#00e676] transition">
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
