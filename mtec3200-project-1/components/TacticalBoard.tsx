"use client";

import React from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { Shield, Users, Sparkles, Shirt } from "lucide-react";

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
  const assignedIds = Object.values(lineup.positions);
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

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Tactical Pitch & Lineup
            </div>
            <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {teamSettings.format} Starting XI & Bench
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Week {activeMatch.week} vs {activeMatch.opponent} • Assign confirmed players to positions
            </p>
          </div>

          {/* Formation Picker */}
          <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 p-1.5 border border-zinc-800 self-start md:self-auto text-xs">
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
        </div>

        {/* Pitch Co-ed Rule Check */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-950/70 p-4 border border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300">
              NYC Footy On-Field Rule:
            </span>
            <span
              className={`text-xs font-bold rounded px-2 py-0.5 ${
                womenOnPitch >= 2
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
              }`}
            >
              {womenOnPitch} / 2 Women on Pitch
            </span>
          </div>

          <div className="text-xs text-zinc-400">
            {availableSquad.length} Confirmed players available for match
          </div>
        </div>
      </div>

      {/* Soccer Pitch Graphic */}
      <div className="mx-auto max-w-3xl">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full rounded-3xl border-4 border-emerald-900/60 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 p-4 shadow-2xl overflow-hidden">
          {/* Turf Stripes Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,#000_40px,#000_80px)]" />

          {/* Pitch Markings */}
          {/* Outer Touchline */}
          <div className="pointer-events-none absolute inset-4 rounded-2xl border-2 border-white/40" />

          {/* Halfway Line */}
          <div className="pointer-events-none absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-white/40" />

          {/* Center Circle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />

          {/* Top Penalty Area (Opponent) */}
          <div className="pointer-events-none absolute left-1/2 top-4 h-24 w-48 -translate-x-1/2 border-b-2 border-l-2 border-r-2 border-white/40 rounded-b-xl" />

          {/* Bottom Penalty Area (Our GK) */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 h-24 w-48 -translate-x-1/2 border-t-2 border-l-2 border-r-2 border-white/40 rounded-t-xl" />
          <div className="pointer-events-none absolute bottom-12 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/60" />

          {/* Player Position Slots */}
          {currentSlots.map((slot) => {
            const assignedPlayerId = lineup.positions[slot.id];
            const assignedPlayer = availableSquad.find(
              (p) => p.id === assignedPlayerId
            );

            return (
              <div
                key={slot.id}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-10 flex flex-col items-center group cursor-pointer"
              >
                {/* Jersey Badge */}
                <div
                  className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-xl transition transform group-hover:scale-110 border-2 ${
                    assignedPlayer
                      ? assignedPlayer.gender === "female"
                        ? "bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400/50"
                        : "bg-emerald-500 text-zinc-950 border-white ring-2 ring-emerald-300/50"
                      : "bg-zinc-950/80 border-dashed border-white/50 text-white/70 backdrop-blur-sm"
                  }`}
                >
                  <Shirt className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="absolute text-[10px] sm:text-xs font-black">
                    {assignedPlayer?.number ? `#${assignedPlayer.number}` : slot.label}
                  </span>
                </div>

                {/* Slot Label & Player Selector */}
                <div className="mt-1.5">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes Bench */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Substitutes Bench (Rotation)</h4>
          </div>
          <span className="text-xs text-zinc-400 font-semibold">
            {benchSquad.length} Players on Bench
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {benchSquad.length === 0 ? (
            <div className="text-xs text-zinc-500 py-3 italic">
              All confirmed players are currently placed in the starting lineup.
            </div>
          ) : (
            benchSquad.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-xs"
              >
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
                  <div className="font-bold text-white">{player.name}</div>
                  <div className="text-[10px] text-zinc-400">
                    Pos: {player.positions.join(", ")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
