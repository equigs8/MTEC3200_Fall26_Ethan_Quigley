"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  Shield,
  Calendar,
  Vote,
  UserPlus,
  Compass,
  Settings,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HeartHandshake,
  X,
  Sparkles,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openTeamSettings: () => void;
  openLeagueAppsSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openTeamSettings,
  openLeagueAppsSync,
}) => {
  const { teamSettings, matchMetrics } = useTeamHub();
  const [showCodeOfConduct, setShowCodeOfConduct] = useState(false);

  const navItems = [
    { id: "overview", label: "Match Hub", shortLabel: "Match", icon: Compass },
    { id: "poll", label: "Weekly Poll", shortLabel: "Poll", icon: Vote },
    {
      id: "subs",
      label: "Sub Finder",
      shortLabel: "Subs",
      icon: UserPlus,
      badge:
        matchMetrics.playerShortage > 0 || matchMetrics.femaleShortage > 0
          ? `${matchMetrics.playerShortage > 0 ? matchMetrics.playerShortage : "!"}`
          : undefined,
    },
    { id: "tactics", label: "Lineup", shortLabel: "Lineup", icon: Shield },
    { id: "schedule", label: "Schedule", shortLabel: "Schedule", icon: Calendar },
  ];

  return (
    <>
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090d12]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
          {/* Brand & Team Info */}
          <div className="flex items-center gap-3">
            {/* NYC Footy Official Crest / Icon */}
            <div className="relative group cursor-pointer flex items-center">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#10b981] to-[#047857] shadow-lg shadow-emerald-950/60 p-1 border border-emerald-400/40 text-white font-black">
                <span className="text-xl select-none">⚽</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">
                  {teamSettings.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-[#00e676] border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] animate-pulse" />
                  {teamSettings.format}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-medium text-emerald-400/90 tracking-wide uppercase text-[10px]">
                  NYC FOOTY
                </span>
                <span className="text-zinc-600">•</span>
                <span className="truncate max-w-[150px] sm:max-w-none text-zinc-300">
                  {teamSettings.leagueName} ({teamSettings.division})
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-[#111823] p-1 border border-zinc-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2">
            {/* Squad Readiness Status Pill (Desktop) */}
            <div
              onClick={() => setActiveTab("subs")}
              className={`hidden lg:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer border transition-all ${
                matchMetrics.isReady
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                  : "bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
              }`}
            >
              {matchMetrics.isReady ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#00e676]" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
              )}
              <span>
                {matchMetrics.isReady
                  ? `Squad Ready (${matchMetrics.totalConfirmed}/${matchMetrics.targetSquadSize})`
                  : matchMetrics.statusLabel}
              </span>
            </div>

            {/* Ted Lasso Code of Conduct Button */}
            <button
              onClick={() => setShowCodeOfConduct(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-colors"
              title="NYC Footy Ted Lasso Code of Conduct"
            >
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
              <span className="hidden xl:inline text-[11px] font-semibold">Spirit</span>
            </button>

            {/* LeagueApps Sync Button */}
            <button
              onClick={openLeagueAppsSync}
              className="flex items-center gap-1.5 rounded-lg border border-sky-900/60 bg-sky-950/40 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 hover:text-white transition-colors"
              title="Sync with NYC Footy LeagueApps Schedule & Roster"
            >
              <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Team Settings Button */}
            <button
              onClick={openTeamSettings}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#111823] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Edit Team Name, Format & Lineup Settings"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom App Bar (Optimized for 1-hand thumb navigation) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/90 bg-[#090d12]/95 backdrop-blur-xl md:hidden px-2 pt-1 pb-safe shadow-2xl">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-1 flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isActive
                    ? "text-[#00e676] font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0.5 h-1 w-6 rounded-full bg-[#00e676] shadow-sm shadow-emerald-400" />
                )}
                <div className="relative mt-0.5">
                  <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-1 truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NYC Footy "Ted Lasso Code of Conduct" Modal */}
      {showCodeOfConduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-[#111823] p-6 shadow-2xl">
            <button
              onClick={() => setShowCodeOfConduct(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">NYC Footy Spirit</h3>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  The Ted Lasso Code of Conduct
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
              NYC Footy was founded on the belief that adult soccer should be competitive, inclusive, and fundamentally joyful. Every match is governed by sportsmanship:
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 rounded-xl bg-[#090d12] p-3 border border-zinc-800">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Be Curious, Not Judgmental</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    We welcome all skill levels. Lift up teammates, encourage newcomers, and leave frustration at the sideline.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#090d12] p-3 border border-zinc-800">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Respect the Referees & Opponents</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Zero verbal abuse or aggressive dissent. High five the opposing team after every final whistle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#090d12] p-3 border border-zinc-800">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Community & Coed Balance</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pass the ball, ensure equal playtime, and strictly honor the 2+ female field requirement in coed divisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-400 italic">Play hard, play fair, have fun!</span>
              <button
                onClick={() => setShowCodeOfConduct(false)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                Got It! ⚽
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
