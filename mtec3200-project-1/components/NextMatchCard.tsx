"use client";

import React, { useState, useEffect } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  MapPin,
  Clock,
  Shirt,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Share2,
  Train,
  ShieldAlert,
  Flame,
  Award,
} from "lucide-react";

interface NextMatchCardProps {
  onGoToPoll: () => void;
  onGoToSubs: () => void;
  onOpenShareModal: () => void;
}

export const NextMatchCard: React.FC<NextMatchCardProps> = ({
  onGoToPoll,
  onGoToSubs,
  onOpenShareModal,
}) => {
  const { activeMatch, matchMetrics, teamSettings } = useTeamHub();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

  const [pollCutoffLeft, setPollCutoffLeft] = useState<{
    hours: number;
    minutes: number;
    isPast: boolean;
  }>({ hours: 0, minutes: 0, isPast: false });

  useEffect(() => {
    if (!activeMatch) return;

    const calculateTimes = () => {
      const matchDateTime = new Date(`${activeMatch.date}T${activeMatch.time}:00`);
      const now = new Date();
      const diffMs = matchDateTime.getTime() - now.getTime();

      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }

      // Poll deadline
      const deadline = new Date(activeMatch.pollDeadline);
      const pollDiff = deadline.getTime() - now.getTime();
      if (pollDiff > 0) {
        const hours = Math.floor(pollDiff / (1000 * 60 * 60));
        const minutes = Math.floor((pollDiff / (1000 * 60)) % 60);
        setPollCutoffLeft({ hours, minutes, isPast: false });
      } else {
        setPollCutoffLeft({ hours: 0, minutes: 0, isPast: true });
      }
    };

    calculateTimes();
    const interval = setInterval(calculateTimes, 30000);
    return () => clearInterval(interval);
  }, [activeMatch]);

  if (!activeMatch) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-[#111823] p-8 text-center text-zinc-400">
        No upcoming match scheduled.
      </div>
    );
  }

  const matchDate = new Date(`${activeMatch.date}T${activeMatch.time}:00`);
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const percentFull = Math.min(
    100,
    Math.round((matchMetrics.totalConfirmed / matchMetrics.targetSquadSize) * 100)
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Decorative turf lighting glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Top Bar: Week Badge, Division & Match Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black tracking-wide text-[#00e676] border border-emerald-500/30">
            WEEK {activeMatch.week}
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            NYC Footy • {teamSettings.division}
          </span>
        </div>

        {/* Kickoff Countdown */}
        <div className="flex items-center gap-2 rounded-xl bg-[#090d12] px-3.5 py-1.5 border border-zinc-800 text-xs">
          <Clock className="h-3.5 w-3.5 text-[#00e676]" />
          <span className="text-zinc-400 font-medium">Kickoff in:</span>
          <span className="font-mono font-bold text-white">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>
      </div>

      {/* Match Fixture Title & Opponent */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Award className="h-3.5 w-3.5 text-[#00e676]" />
            Official NYC Footy Fixture
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-4xl">
            {teamSettings.name}{" "}
            <span className="text-zinc-500 font-normal">vs</span>{" "}
            <span className="text-emerald-300">{activeMatch.opponent}</span>
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-zinc-300">
            <span className="font-semibold text-white">{formattedDate}</span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 font-semibold text-[#00e676]">
              <Clock className="h-4 w-4" />
              {activeMatch.time} EDT
            </span>
            <span className="text-zinc-600">•</span>
            <span className="rounded-md bg-[#090d12] px-2 py-0.5 text-xs text-zinc-300 border border-zinc-800">
              {teamSettings.format}
            </span>
          </div>
        </div>

        {/* Action Buttons (Full width on mobile, inline on desktop) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenShareModal}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-700 transition shadow-sm active:scale-95"
          >
            <Share2 className="h-4 w-4 text-[#00e676]" />
            <span>Share to WhatsApp</span>
          </button>
          <button
            onClick={onGoToPoll}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-950/60 active:scale-95"
          >
            <span>RSVP Now</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Match Details Grid */}
      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Field & Pitch Info */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12]/90 p-4 transition hover:border-zinc-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <MapPin className="h-4 w-4 text-[#00e676]" />
              LOCATION & PITCH
            </div>
            <a
              href={activeMatch.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#00e676] hover:underline flex items-center gap-1 font-semibold"
            >
              Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="mt-2 text-sm sm:text-base font-bold text-white">
            {activeMatch.location}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 font-medium">
            {activeMatch.fieldNumber}
          </div>
          {activeMatch.subwayInfo && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-zinc-400 border-t border-zinc-800/80 pt-2">
              <Train className="h-3.5 w-3.5 text-[#00e676] shrink-0 mt-0.5" />
              <span>{activeMatch.subwayInfo}</span>
            </div>
          )}
        </div>

        {/* Kit & Jersey Advisor */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12]/90 p-4 transition hover:border-zinc-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Shirt className="h-4 w-4 text-[#00e676]" />
            KIT / JERSEY COLOR
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md border ${
                activeMatch.kitColor === "Light"
                  ? "bg-zinc-100 text-zinc-900 border-zinc-300"
                  : "bg-blue-950 text-white border-blue-700"
              }`}
            >
              {activeMatch.kitColor === "Light" ? "L" : "D"}
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">
                Wear {activeMatch.kitColor} Kit
              </div>
              <div className="text-xs text-zinc-400">
                {activeMatch.kitColor === "Light"
                  ? `${teamSettings.homeKitColor} (Home Team)`
                  : `${teamSettings.awayKitColor} (Away Team)`}
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-2">
            Bring alternate kit just in case referee calls a clash.
          </div>
        </div>

        {/* RSVP Deadline Status */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12]/90 p-4 transition hover:border-zinc-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Flame className="h-4 w-4 text-amber-400" />
              POLL DEADLINE
            </div>
            <span
              className={`text-[10px] font-bold uppercase rounded-lg px-2 py-0.5 ${
                pollCutoffLeft.isPast
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {pollCutoffLeft.isPast ? "Closed" : "Active Poll"}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white">
              {pollCutoffLeft.isPast ? (
                <span className="text-rose-400">Cutoff Passed (Subs Activated)</span>
              ) : (
                <span>
                  Closes in{" "}
                  <span className="text-amber-300 font-mono">
                    {pollCutoffLeft.hours}h {pollCutoffLeft.minutes}m
                  </span>
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">
              Deadline:{" "}
              {new Date(activeMatch.pollDeadline).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2 flex items-center justify-between">
            <span>Late votes trigger sub alerts.</span>
            <button
              onClick={onGoToPoll}
              className="text-[#00e676] font-semibold hover:underline"
            >
              View Poll &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Live Squad Health & Shortage Alert Banner */}
      <div className="mt-5 rounded-2xl border border-zinc-800/80 bg-[#090d12]/95 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Roster Readiness ({matchMetrics.totalConfirmed}/{matchMetrics.targetSquadSize})
                </span>
                {matchMetrics.isReady ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-[#00e676] border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" /> Game On
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30 animate-pulse">
                    <ShieldAlert className="h-3 w-3" /> Shortage
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-400">
                {percentFull}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  matchMetrics.isReady
                    ? "bg-gradient-to-r from-emerald-500 to-[#00e676]"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                style={{ width: `${percentFull}%` }}
              />
            </div>

            {/* Co-ed Rule Check */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-200">
                  {teamSettings.format} Target:
                </span>
                <span>{matchMetrics.targetSquadSize} players</span>
              </div>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-200">Co-ed Rule:</span>
                <span
                  className={
                    matchMetrics.femaleShortage > 0
                      ? "text-amber-400 font-semibold"
                      : "text-[#00e676] font-semibold"
                  }
                >
                  {matchMetrics.femaleConfirmed}/{matchMetrics.minFemale} Women confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Sub Alert Action if Short */}
          {!matchMetrics.isReady && (
            <div className="shrink-0 flex items-center">
              <button
                onClick={onGoToSubs}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-amber-400 transition shadow-lg shadow-amber-950/40 active:scale-95"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Sub Finder ({matchMetrics.playerShortage} Short)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
