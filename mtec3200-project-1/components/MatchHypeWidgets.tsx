"use client";

import React, { useState, useEffect } from "react";
import { Match } from "@/types/footy";
import {
  Clock,
  CloudSun,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  Footprints,
  Sparkles,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";

interface MatchHypeWidgetsProps {
  match: Match;
}

export const MatchHypeWidgets: React.FC<MatchHypeWidgetsProps> = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  useEffect(() => {
    const calculateTime = () => {
      const matchDateTime = new Date(`${match.date}T${match.time || "16:00"}:00`);
      const now = new Date();
      const difference = matchDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [match.date, match.time]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) {
      soundFx.playPop();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {/* Live Countdown Clock */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12]/80 p-3.5 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
            <span>Kickoff Countdown</span>
          </div>
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute interactive audio" : "Enable match sound effects"}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 transition active:scale-95"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3 w-3 text-emerald-400" />
                <span className="hidden sm:inline">SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3 text-zinc-500" />
                <span className="hidden sm:inline">SFX Off</span>
              </>
            )}
          </button>
        </div>

        {timeLeft.isPast ? (
          <div className="text-center py-2 text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Match in progress or completed!
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl bg-[#111823] p-1.5 border border-zinc-800">
              <span className="block text-lg font-black text-white font-mono leading-none">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-zinc-400">Days</span>
            </div>
            <div className="rounded-xl bg-[#111823] p-1.5 border border-zinc-800">
              <span className="block text-lg font-black text-white font-mono leading-none">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-zinc-400">Hours</span>
            </div>
            <div className="rounded-xl bg-[#111823] p-1.5 border border-zinc-800">
              <span className="block text-lg font-black text-emerald-400 font-mono leading-none">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-zinc-400">Mins</span>
            </div>
            <div className="rounded-xl bg-[#111823] p-1.5 border border-zinc-800">
              <span className="block text-lg font-black text-amber-400 font-mono leading-none">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-zinc-400">Secs</span>
            </div>
          </div>
        )}
      </div>

      {/* Match Conditions & Turf Report */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12]/80 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <CloudSun className="h-3.5 w-3.5 text-teal-300" />
            <span>Pitch Conditions</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Bushwick Inlet Park
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 rounded-xl bg-[#111823] px-2.5 py-1.5 border border-zinc-800/80">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400 leading-tight">Forecast</div>
              <div className="text-xs font-bold text-white leading-tight">68°F • Clear</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#111823] px-2.5 py-1.5 border border-zinc-800/80">
            <Footprints className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400 leading-tight">Footwear</div>
              <div className="text-xs font-bold text-white leading-tight">AG / Turf Cleats</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
