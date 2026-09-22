"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { RSVPStatus } from "@/types/footy";
import {
  Check,
  X,
  HelpCircle,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Sparkles,
  Shield,
} from "lucide-react";

interface AttendancePollProps {
  onGoToSubs: () => void;
}

export const AttendancePoll: React.FC<AttendancePollProps> = ({ onGoToSubs }) => {
  const {
    activeMatch,
    players,
    updateRSVP,
    matchMetrics,
    teamSettings,
  } = useTeamHub();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("p1"); // Ethan by default
  const [maybeReason, setMaybeReason] = useState<string>("");
  const [filter, setFilter] = useState<"all" | RSVPStatus>("all");
  const [showReasonModalFor, setShowReasonModalFor] = useState<{
    playerId: string;
    targetStatus: RSVPStatus;
  } | null>(null);

  if (!activeMatch) return null;

  const currentPlayer = players.find((p) => p.id === selectedPlayerId) || players[0];
  const currentRSVP = activeMatch.rsvps[currentPlayer.id]?.status || "pending";

  const handleVote = (status: RSVPStatus, reason?: string) => {
    updateRSVP(activeMatch.id, currentPlayer.id, status, reason);
  };

  const handleQuickCaptainToggle = (playerId: string, newStatus: RSVPStatus) => {
    updateRSVP(activeMatch.id, playerId, newStatus);
  };

  // Group players by status
  const confirmedList = players.filter((p) => activeMatch.rsvps[p.id]?.status === "yes");
  const maybeList = players.filter((p) => activeMatch.rsvps[p.id]?.status === "maybe");
  const outList = players.filter((p) => activeMatch.rsvps[p.id]?.status === "no");
  const pendingList = players.filter(
    (p) => !activeMatch.rsvps[p.id] || activeMatch.rsvps[p.id]?.status === "pending"
  );

  const filteredPlayers = players.filter((p) => {
    const status = activeMatch.rsvps[p.id]?.status || "pending";
    if (filter === "all") return true;
    return status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Attendance Voting Hero Panel */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly Attendance Poll
            </div>
            <h3 className="mt-1 text-2xl font-black text-white">
              Are you playing Week {activeMatch.week} vs {activeMatch.opponent}?
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Deadline:{" "}
              {new Date(activeMatch.pollDeadline).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}{" "}
              • Definitive answers ensure we don&apos;t scramble for subs!
            </p>
          </div>

          {/* Voting as Selector */}
          <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 p-2 border border-zinc-800 self-start md:self-auto">
            <span className="text-xs font-medium text-zinc-400 pl-2">Voting as:</span>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white border border-zinc-700 focus:outline-none focus:border-emerald-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isCaptain ? "⭐ (Captain)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-Tap RSVP Buttons */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-zinc-400 mb-3">
            Select RSVP for <span className="text-white font-bold">{currentPlayer.name}</span>:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Yes Button */}
            <button
              onClick={() => handleVote("yes")}
              className={`flex items-center justify-center gap-3 rounded-2xl p-4 text-sm font-bold transition-all ${
                currentRSVP === "yes"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-emerald-700/50 hover:bg-zinc-900"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentRSVP === "yes" ? "bg-emerald-700" : "bg-zinc-800 text-emerald-400"
                }`}
              >
                <Check className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div>I&apos;m In (Playing)</div>
                <div className="text-[11px] font-normal opacity-80">Confirmed ready to play</div>
              </div>
            </button>

            {/* Maybe Button */}
            <button
              onClick={() => {
                setShowReasonModalFor({ playerId: currentPlayer.id, targetStatus: "maybe" });
              }}
              className={`flex items-center justify-center gap-3 rounded-2xl p-4 text-sm font-bold transition-all ${
                currentRSVP === "maybe"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-950/60 ring-2 ring-amber-400"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-amber-700/50 hover:bg-zinc-900"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentRSVP === "maybe" ? "bg-amber-700" : "bg-zinc-800 text-amber-400"
                }`}
              >
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div>Maybe (Provide Reason)</div>
                <div className="text-[11px] font-normal opacity-80">Keep captain informed</div>
              </div>
            </button>

            {/* No Button */}
            <button
              onClick={() => {
                setShowReasonModalFor({ playerId: currentPlayer.id, targetStatus: "no" });
              }}
              className={`flex items-center justify-center gap-3 rounded-2xl p-4 text-sm font-bold transition-all ${
                currentRSVP === "no"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-rose-700/50 hover:bg-zinc-900"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentRSVP === "no" ? "bg-rose-700" : "bg-zinc-800 text-rose-400"
                }`}
              >
                <X className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div>Can&apos;t Make It (Out)</div>
                <div className="text-[11px] font-normal opacity-80">Triggers sub outreach</div>
              </div>
            </button>
          </div>

          {activeMatch.rsvps[currentPlayer.id]?.reason && (
            <div className="mt-3 rounded-xl bg-zinc-950/60 px-4 py-2 text-xs text-zinc-400 border border-zinc-800 flex items-center gap-2">
              <span className="font-semibold text-zinc-300">Reason note:</span>
              <span>&ldquo;{activeMatch.rsvps[currentPlayer.id]?.reason}&rdquo;</span>
            </div>
          )}
        </div>
      </div>

      {/* Roster KPIs & Quotas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Confirmed KPI */}
        <div
          onClick={() => setFilter("yes")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            filter === "yes"
              ? "border-emerald-500 bg-emerald-950/40"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>CONFIRMED</span>
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {confirmedList.length}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Target: {teamSettings.targetSquadSize} players
          </div>
        </div>

        {/* Co-ed Women KPI */}
        <div
          className={`rounded-2xl p-4 border ${
            matchMetrics.femaleShortage > 0
              ? "border-amber-800/80 bg-amber-950/40"
              : "border-zinc-800 bg-zinc-900/60"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>WOMEN ON FIELD</span>
            <Shield className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {matchMetrics.femaleConfirmed} / {matchMetrics.minFemale}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {matchMetrics.femaleShortage > 0 ? (
              <span className="text-amber-400 font-semibold">
                Short {matchMetrics.femaleShortage} woman sub
              </span>
            ) : (
              <span className="text-emerald-400">Co-ed rule satisfied</span>
            )}
          </div>
        </div>

        {/* Maybe KPI */}
        <div
          onClick={() => setFilter("maybe")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            filter === "maybe"
              ? "border-amber-500 bg-amber-950/40"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>MAYBE</span>
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{maybeList.length}</div>
          <div className="mt-1 text-xs text-zinc-400">Limbo responses</div>
        </div>

        {/* Unanswered / Out KPI */}
        <div
          onClick={() => setFilter("no")}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            filter === "no"
              ? "border-rose-500 bg-rose-950/40"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-400">
            <span>OUT / PENDING</span>
            <UserX className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {outList.length + pendingList.length}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {outList.length} Out • {pendingList.length} Awaiting
          </div>
        </div>
      </div>

      {/* Squad Shortage Alert & Action Banner */}
      {!matchMetrics.isReady && (
        <div className="rounded-2xl border border-amber-800/80 bg-gradient-to-r from-amber-950/80 to-zinc-950 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Squad Shortage Detected for Week {activeMatch.week}
              </h4>
              <p className="text-xs text-zinc-300">
                You have {matchMetrics.totalConfirmed} confirmed players (target {matchMetrics.targetSquadSize}).
                {matchMetrics.femaleShortage > 0 &&
                  ` Need at least ${matchMetrics.femaleShortage} more woman player for official NYC Footy co-ed rules.`}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToSubs}
            className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition shadow-md"
          >
            Launch Sub Finder &rarr;
          </button>
        </div>
      )}

      {/* Roster Attendance Table & Captain Quick-Override */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-white">Team Roster Responses</h4>
            <p className="text-xs text-zinc-400">
              Captains can 1-click override player attendance if someone messaged in WhatsApp.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                filter === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({players.length})
            </button>
            <button
              onClick={() => setFilter("yes")}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                filter === "yes" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Yes ({confirmedList.length})
            </button>
            <button
              onClick={() => setFilter("maybe")}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                filter === "maybe" ? "bg-amber-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Maybe ({maybeList.length})
            </button>
            <button
              onClick={() => setFilter("no")}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                filter === "no" ? "bg-rose-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Out ({outList.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                filter === "pending" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Pending ({pendingList.length})
            </button>
          </div>
        </div>

        {/* Player List */}
        <div className="divide-y divide-zinc-800/60">
          {filteredPlayers.map((player) => {
            const rsvp = activeMatch.rsvps[player.id];
            const status = rsvp?.status || "pending";

            return (
              <div
                key={player.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition"
              >
                {/* Player Profile & Info */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 font-bold text-sm text-zinc-300 border border-zinc-700">
                    {player.number ? `#${player.number}` : "⚽"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {player.name}
                      </span>
                      {player.isCaptain && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          Captain
                        </span>
                      )}
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                          player.gender === "female"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {player.gender === "female" ? "F" : "M"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>Pos: {player.preferredPositions.join(", ")}</span>
                      {rsvp?.reason && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-amber-400/90 italic truncate max-w-[240px]">
                            &ldquo;{rsvp.reason}&rdquo;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Captain Override Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {/* Current Status Pill */}
                  <div>
                    {status === "yes" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                        <Check className="h-3 w-3" /> In
                      </span>
                    )}
                    {status === "maybe" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                        <HelpCircle className="h-3 w-3" /> Maybe
                      </span>
                    )}
                    {status === "no" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
                        <X className="h-3 w-3" /> Out
                      </span>
                    )}
                    {status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400 border border-zinc-700">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Captain Override 1-Click Toggles */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => handleQuickCaptainToggle(player.id, "yes")}
                      title="Quick mark as Going"
                      className={`p-1.5 rounded-lg transition ${
                        status === "yes"
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setShowReasonModalFor({ playerId: player.id, targetStatus: "maybe" })
                      }
                      title="Quick mark as Maybe"
                      className={`p-1.5 rounded-lg transition ${
                        status === "maybe"
                          ? "bg-amber-600 text-white"
                          : "text-zinc-500 hover:text-amber-400 hover:bg-zinc-900"
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setShowReasonModalFor({ playerId: player.id, targetStatus: "no" })
                      }
                      title="Quick mark as Out"
                      className={`p-1.5 rounded-lg transition ${
                        status === "no"
                          ? "bg-rose-600 text-white"
                          : "text-zinc-500 hover:text-rose-400 hover:bg-zinc-900"
                      }`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white">
              {showReasonModalFor.targetStatus === "maybe" ? "Maybe RSVP" : "Can't Make It"}
            </h4>
            <p className="mt-1 text-xs text-zinc-400">
              Please share a quick note for the captain (optional):
            </p>

            <textarea
              rows={3}
              value={maybeReason}
              onChange={(e) => setMaybeReason(e.target.value)}
              placeholder={
                showReasonModalFor.targetStatus === "maybe"
                  ? "e.g., Might work late, will know by Friday 2pm"
                  : "e.g., Out of town, wedding, injured"
              }
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowReasonModalFor(null);
                  setMaybeReason("");
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateRSVP(
                    activeMatch.id,
                    showReasonModalFor.playerId,
                    showReasonModalFor.targetStatus,
                    maybeReason || undefined
                  );
                  setShowReasonModalFor(null);
                  setMaybeReason("");
                }}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition ${
                  showReasonModalFor.targetStatus === "maybe"
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                Confirm RSVP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
