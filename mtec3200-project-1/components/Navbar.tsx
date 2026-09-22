"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { UserRole } from "@/types/footy";
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
  User,
  ChevronDown,
  Sparkles,
  LogIn,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { footyClerkTheme } from "@/lib/clerkTheme";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openTeamSettings: () => void;
  openLeagueAppsSync: () => void;
  openProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openTeamSettings,
  openLeagueAppsSync,
  openProfileModal,
}) => {
  const {
    teamSettings,
    matchMetrics,
    currentUser,
    activeRole,
    setActiveRole,
    userProfiles,
    switchPersona,
    isClerkSignedIn,
    clerkUser,
  } = useTeamHub();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

  // Dynamic Navigation Items based on Active Role
  const navItems =
    activeRole === "player"
      ? [
          { id: "player_view", label: "My Match & RSVP", shortLabel: "My Match", icon: Compass },
          { id: "free_agents", label: "Free Agent Pool", shortLabel: "Sub Pool", icon: UserPlus },
          { id: "schedule", label: "Schedule", shortLabel: "Schedule", icon: Calendar },
        ]
      : activeRole === "free_agent"
      ? [
          { id: "free_agents", label: "Sub Marketplace", shortLabel: "Marketplace", icon: UserPlus },
          { id: "player_view", label: "My Sub Profile", shortLabel: "Profile", icon: Compass },
          { id: "schedule", label: "Schedule", shortLabel: "Schedule", icon: Calendar },
        ]
      : [
          { id: "overview", label: "Match Hub", shortLabel: "Match", icon: Compass },
          { id: "poll", label: "Weekly Poll", shortLabel: "Poll", icon: Vote },
          {
            id: "subs",
            label: "Sub Portal",
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
            <div
              onClick={() => setActiveTab(activeRole === "player" ? "player_view" : "overview")}
              className="relative group cursor-pointer flex items-center"
            >
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
                  {teamSettings.division}
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
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-all ${
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

          {/* User Persona & Actions */}
          <div className="flex items-center gap-2">
            {/* Squad Readiness Status Pill (Captain mode) */}
            {activeRole === "captain" && (
              <div
                onClick={() => setActiveTab("subs")}
                className={`hidden xl:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer border transition-all ${
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
            )}

            {/* Persona Quick-Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#111823] px-2.5 py-1.5 text-xs font-bold text-white hover:border-emerald-500 transition shadow-sm"
              >
                <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black overflow-hidden border border-emerald-500/30 shrink-0">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {currentUser.role === "captain" ? "👑" : currentUser.role === "player" ? "⚽" : "🏃‍♀️"}
                    </span>
                  )}
                  {isClerkSignedIn && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#00e676] ring-1 ring-black"
                      title="Clerk Account Linked"
                    />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[100px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 block leading-tight font-bold">
                    {currentUser.role}
                    {isClerkSignedIn && " • Clerk"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {/* Persona Switch Menu */}
              {isPersonaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-zinc-800 bg-[#111823] p-2.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  {/* Clerk Sync Status Banner */}
                  {isClerkSignedIn && clerkUser ? (
                    <div className="mb-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#00e676] animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                          Clerk Account Linked
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-300 truncate mt-1">
                        {clerkUser.primaryEmailAddress?.emailAddress || clerkUser.fullName}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
                      💡 Sign in to sync your personal footy profile &amp; receive team alerts.
                    </div>
                  )}

                  <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Switch Active Persona
                  </div>
                  <div className="space-y-1 my-1">
                    {userProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          switchPersona(profile.id);
                          setIsPersonaMenuOpen(false);
                          if (profile.role === "player") setActiveTab("player_view");
                          else if (profile.role === "free_agent") setActiveTab("free_agents");
                          else setActiveTab("overview");
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          currentUser.id === profile.id
                            ? "bg-emerald-950/60 border border-emerald-500/40 text-white font-bold"
                            : "hover:bg-zinc-800/60 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-6 w-6 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-800 text-[11px] shrink-0 border border-zinc-700/60">
                            {profile.avatar ? (
                              <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {profile.role === "captain" ? "👑" : profile.role === "player" ? "⚽" : "🏃‍♀️"}
                              </span>
                            )}
                          </div>
                          <div className="truncate">
                            <span className="block font-semibold truncate">{profile.name}</span>
                            <span className="block text-[10px] text-zinc-400 capitalize">
                              {profile.role} • {profile.skillLevel || "P3"}
                            </span>
                          </div>
                        </div>
                        {currentUser.id === profile.id && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#00e676] shrink-0 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                    <button
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        openProfileModal();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-950/30 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Edit My Profile &amp; Skill Level</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clerk Authentication Controls */}
            <div className="flex items-center">
              <Show when="signed-in">
                <UserButton
                  appearance={footyClerkTheme}
                />
              </Show>

              <Show when="signed-out">
                <div className="flex items-center gap-1.5">
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#111823] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500 hover:text-white transition active:scale-95 shadow-sm">
                      <LogIn className="h-3.5 w-3.5 text-[#00e676]" />
                      <span>Sign In</span>
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="hidden sm:flex items-center gap-1 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-950/40 active:scale-95">
                      <span>Sign Up</span>
                    </button>
                  </SignUpButton>
                </div>
              </Show>
            </div>

            {/* LeagueApps Sync Button */}
            <button
              onClick={openLeagueAppsSync}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-sky-900/60 bg-sky-950/40 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 hover:text-white transition-colors"
              title="Sync with NYC Footy LeagueApps Schedule & Roster"
            >
              <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
              <span>Sync</span>
            </button>

            {/* Team Settings Button (Captain only) */}
            {activeRole === "captain" && (
              <button
                onClick={openTeamSettings}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111823] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Edit Team Name, Format & Lineup Settings"
              >
                <Settings className="h-4 w-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom App Bar */}
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
    </>
  );
};
