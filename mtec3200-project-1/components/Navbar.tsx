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
  Menu,
  X,
  RefreshCw,
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
  const { teamSettings, matchMetrics, activeMatch } = useTeamHub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Match Hub", icon: Compass },
    { id: "poll", label: "Weekly Poll", icon: Vote },
    {
      id: "subs",
      label: "Sub Finder",
      icon: UserPlus,
      badge: matchMetrics.playerShortage > 0 || matchMetrics.femaleShortage > 0 ? "Alert" : undefined,
    },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "tactics", label: "Lineup", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Team Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/40 text-white font-black text-lg tracking-wider border border-emerald-400/30">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                {teamSettings.name}
              </h1>
              <span className="hidden rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 sm:inline-block">
                {teamSettings.format}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-[200px] sm:max-w-none">
              {teamSettings.leagueName} • {teamSettings.division}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 border border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
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

        {/* Actions & Status */}
        <div className="flex items-center gap-2">
          {/* Quick Roster Readiness Indicator */}
          <div
            onClick={() => setActiveTab("subs")}
            className={`hidden lg:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer border transition-colors ${
              matchMetrics.isReady
                ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/60"
                : "bg-amber-950/60 border-amber-800/50 text-amber-300 hover:bg-amber-900/60"
            }`}
          >
            {matchMetrics.isReady ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
            )}
            <span>
              {matchMetrics.isReady
                ? `Squad Ready (${matchMetrics.totalConfirmed}/${matchMetrics.targetSquadSize})`
                : matchMetrics.statusLabel}
            </span>
          </div>

          {/* LeagueApps Sync Button */}
          <button
            onClick={openLeagueAppsSync}
            className="flex items-center gap-1.5 rounded-lg border border-blue-900/60 bg-blue-950/60 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-900/60 hover:text-white transition-colors"
            title="Sync with NYC Footy / LeagueApps"
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">LeagueApps</span>
          </button>

          {/* Captain Settings Button */}
          <button
            onClick={openTeamSettings}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Edit Team & Settings"
          >
            <Settings className="h-4 w-4 text-zinc-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                      Alert
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Next: vs {activeMatch?.opponent}</span>
            <span
              className={`font-semibold ${
                matchMetrics.isReady ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {matchMetrics.totalConfirmed}/{matchMetrics.targetSquadSize} Confirmed
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
