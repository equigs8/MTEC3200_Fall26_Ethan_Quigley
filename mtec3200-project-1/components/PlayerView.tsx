"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { RSVPStatus } from "@/types/footy";
import {
  Calendar,
  Clock,
  MapPin,
  Shirt,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Train,
  ExternalLink,
  Shield,
  Sparkles,
  UserCheck,
  Compass,
} from "lucide-react";

interface PlayerViewProps {
  onOpenSubPortal: () => void;
  onOpenProfile: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  onOpenSubPortal,
  onOpenProfile,
}) => {
  const {
    activeMatch,
    players,
    currentUser,
    updateRSVP,
    tacticalLineups,
    teamSettings,
    toggleSubAvailability,
  } = useTeamHub();

  const [reasonInput, setReasonInput] = useState("");
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<RSVPStatus | null>(null);

  if (!activeMatch) return null;

  // Find matching player record for current user, or default to first player matching name/id
  const matchingPlayer =
    players.find(
      (p) =>
        p.id === currentUser.id ||
        (currentUser.clerkId && p.id === `p-${currentUser.clerkId.slice(-4)}`) ||
        p.name.toLowerCase() === currentUser.name.toLowerCase()
    ) || players[1] || players[0];

  const currentRSVP = activeMatch.rsvps[matchingPlayer.id]?.status || "pending";
  const currentReason = activeMatch.rsvps[matchingPlayer.id]?.reason;

  const handleVote = (status: RSVPStatus) => {
    if (status === "maybe" || status === "no") {
      setPendingStatus(status);
      setShowReasonBox(true);
    } else {
      updateRSVP(activeMatch.id, matchingPlayer.id, "yes");
      setShowReasonBox(false);
    }
  };

  const submitReason = () => {
    if (pendingStatus) {
      updateRSVP(activeMatch.id, matchingPlayer.id, pendingStatus, reasonInput.trim());
      setShowReasonBox(false);
      setReasonInput("");
      setPendingStatus(null);
    }
  };

  const confirmedTeammates = players.filter(
    (p) => activeMatch.rsvps[p.id]?.status === "yes"
  );

  const lineup = tacticalLineups[activeMatch.id];
  const assignedSlot = lineup
    ? Object.entries(lineup.positions).find(([_, pId]) => pId === matchingPlayer.id)
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Player Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-3xl border border-zinc-800 bg-[#111823] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-xl font-bold text-white shadow-lg shadow-emerald-950/40 overflow-hidden">
            {currentUser.avatar || matchingPlayer.avatar ? (
              <img
                src={currentUser.avatar || matchingPlayer.avatar}
                alt={matchingPlayer.name}
                className="h-full w-full object-cover"
              />
            ) : (
              matchingPlayer.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Player Hub
              </span>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                {currentUser.skillLevel || "P3"} Division
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{matchingPlayer.name}</h2>
            <p className="text-xs text-zinc-400">
              Rostered on <span className="text-zinc-200 font-semibold">{teamSettings.name}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="self-start sm:self-auto rounded-xl border border-zinc-700 bg-[#090d12] px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-emerald-500 hover:text-white transition"
        >
          Edit Player Profile
        </button>
      </div>

      {/* Main Next Match Card */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-[#111823] to-[#0d131c] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Upcoming Match • Week {activeMatch.week}
            </span>
            <h3 className="mt-1 text-2xl font-black text-white">
              vs {activeMatch.opponent}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Official NYC Footy {teamSettings.division}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-[#090d12] px-3.5 py-2 border border-zinc-800">
              <Shirt className="h-4 w-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-zinc-400 block leading-tight">Team Kit</span>
                <span className="text-xs font-bold text-white leading-tight">
                  {activeMatch.kitColor === "Light" ? teamSettings.homeKitColor : teamSettings.awayKitColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kickoff & Venue Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          <div className="flex items-start gap-3 rounded-2xl bg-[#090d12] p-3.5 border border-zinc-800/80">
            <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Kickoff Time</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {new Date(`${activeMatch.date}T${activeMatch.time}:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at {activeMatch.time}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#090d12] p-3.5 border border-zinc-800/80">
            <MapPin className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 block font-medium">Field Location</span>
                <a
                  href={activeMatch.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
                >
                  Map <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <span className="text-sm font-bold text-white block mt-0.5">
                {activeMatch.location}
              </span>
              <span className="text-xs text-zinc-400 block">{activeMatch.fieldNumber}</span>
              {activeMatch.subwayInfo && (
                <span className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                  <Train className="h-3 w-3 text-amber-400" />
                  {activeMatch.subwayInfo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 1-Tap RSVP Section */}
        <div className="rounded-2xl border border-zinc-800 bg-[#090d12] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Your Weekly Attendance RSVP</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Early definitive responses help captain Ethan organize squad numbers & avoid forfeit fines.
              </p>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  currentRSVP === "yes"
                    ? "bg-emerald-500/20 text-[#00e676] border border-emerald-500/40"
                    : currentRSVP === "no"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    : currentRSVP === "maybe"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                Status: {currentRSVP.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Voting Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleVote("yes")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                currentRSVP === "yes"
                  ? "bg-[#00e676] text-black shadow-lg shadow-emerald-500/30 scale-102"
                  : "bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>I&apos;m In! ⚽</span>
            </button>

            <button
              onClick={() => handleVote("maybe")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                currentRSVP === "maybe"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-102"
                  : "bg-amber-950/50 border border-amber-800/40 text-amber-300 hover:bg-amber-900/60"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Maybe</span>
            </button>

            <button
              onClick={() => handleVote("no")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                currentRSVP === "no"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-102"
                  : "bg-rose-950/50 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60"
              }`}
            >
              <XCircle className="h-4 w-4" />
              <span>Can&apos;t Make It</span>
            </button>
          </div>

          {/* Reason Input Box */}
          {showReasonBox && (
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 animate-in fade-in duration-150">
              <label className="text-xs font-semibold text-zinc-300 block">
                Let captain know why (e.g. work, travel, injury):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="e.g. Flight delay, wedding upstate..."
                  className="flex-1 rounded-xl border border-zinc-700 bg-[#111823] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={submitReason}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  Save Reason
                </button>
              </div>
            </div>
          )}

          {currentReason && !showReasonBox && (
            <p className="mt-2 text-xs text-zinc-400 italic">
              Note on file: &ldquo;{currentReason}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Confirmed Teammates & Lineup Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Squad Status */}
        <div className="rounded-3xl border border-zinc-800 bg-[#111823] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              Confirmed Squad ({confirmedTeammates.length} Playing)
            </h4>
            <span className="text-xs text-zinc-400">7v7 Format</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {confirmedTeammates.map((teammate) => (
              <div
                key={teammate.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d12] border border-zinc-800/80"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300">
                    {teammate.number || "#"}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {teammate.name} {teammate.isCaptain ? "👑" : ""}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {teammate.gender} • {teammate.preferredPositions.join("/")}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#00e676] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pitch Assignment / Tactical Slot */}
        <div className="rounded-3xl border border-zinc-800 bg-[#111823] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Your Tactical Slot
              </h4>
              <span className="text-xs font-bold text-emerald-400">
                Formation: {lineup?.formation || "2-3-1"}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-center my-3">
              <div className="text-xs text-zinc-400 mb-1">Assigned Position This Week:</div>
              <div className="text-2xl font-black text-white">
                {assignedSlot ? assignedSlot[0].replace("_", " ") : "Rotation / Bench"}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                {assignedSlot
                  ? "Starting on pitch"
                  : "Available for tactical substitutions during match"}
              </div>
            </div>
          </div>

          {/* Sub Availability Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#090d12] p-4 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Available to Sub for Other Teams?
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Appear in the NYC Footy Free Agent pool on your off-weeks.
                </span>
              </div>
              <button
                onClick={() =>
                  toggleSubAvailability(!currentUser.subAvailability?.isAvailable)
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentUser.subAvailability?.isAvailable
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {currentUser.subAvailability?.isAvailable ? "Active Sub ⚽" : "Not Available"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
