"use client";

import React, { useState, useEffect } from "react";
import { TeamHubProvider, useTeamHub } from "@/context/TeamHubContext";
import { Navbar } from "@/components/Navbar";
import { NextMatchCard } from "@/components/NextMatchCard";
import { AttendancePoll } from "@/components/AttendancePoll";
import { FreeAgentPortal } from "@/components/FreeAgentPortal";
import { PlayerView } from "@/components/PlayerView";
import { WorkflowAlertBanner } from "@/components/WorkflowAlertBanner";
import { ScheduleList } from "@/components/ScheduleList";
import { TacticalBoard } from "@/components/TacticalBoard";
import { CaptainToolsModal } from "@/components/CaptainToolsModal";
import { LeagueAppsModal } from "@/components/LeagueAppsModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import {
  Vote,
  UserPlus,
  Shield,
  ArrowRight,
} from "lucide-react";

function TeamDashboardInner() {
  const { matchMetrics, teamSettings, activeRole } = useTeamHub();

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLeagueAppsOpen, setIsLeagueAppsOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<"settings" | "share" | "roster">("settings");
  const [freeAgentGenderFilter, setFreeAgentGenderFilter] = useState<"all" | "female">("all");

  // Adjust active tab when role changes
  useEffect(() => {
    if (activeRole === "player") {
      setActiveTab("player_view");
    } else if (activeRole === "free_agent") {
      setActiveTab("free_agents");
    } else {
      setActiveTab("overview");
    }
  }, [activeRole]);

  const handleOpenShare = () => {
    setSettingsDefaultTab("share");
    setIsSettingsOpen(true);
  };

  const handleOpenSettings = () => {
    setSettingsDefaultTab("settings");
    setIsSettingsOpen(true);
  };

  const handleOpenSubPortalWithFilter = (gender?: "female") => {
    setFreeAgentGenderFilter(gender || "all");
    setActiveTab("free_agents");
  };

  return (
    <div className="min-h-screen bg-[#090d12] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation Bar & Mobile App Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTeamSettings={handleOpenSettings}
        openLeagueAppsSync={() => setIsLeagueAppsOpen(true)}
        openProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3.5 py-5 sm:px-6 sm:py-8 pb-24 md:pb-8">
        {/* Player View */}
        {activeTab === "player_view" && (
          <PlayerView
            onOpenSubPortal={() => setActiveTab("free_agents")}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {/* Free Agent & Sub Portal */}
        {(activeTab === "free_agents" || activeTab === "subs") && (
          <FreeAgentPortal initialGenderFilter={freeAgentGenderFilter} />
        )}

        {/* Captain Tab 1: Overview / Match Hub */}
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Real-time Roster & Female Rule Workflow Banner */}
            <WorkflowAlertBanner onOpenSubPortalWithFilter={handleOpenSubPortalWithFilter} />

            {/* Hero Card for Next Match */}
            <NextMatchCard
              onGoToPoll={() => setActiveTab("poll")}
              onGoToSubs={() => handleOpenSubPortalWithFilter()}
              onOpenShareModal={handleOpenShare}
            />

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Poll Glimpse Card */}
              <div
                onClick={() => setActiveTab("poll")}
                className="group cursor-pointer rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-6 transition-all hover:border-[#00e676]/60 hover:bg-[#161f2e] shadow-lg active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-[#00e676] border border-emerald-500/30">
                    <Vote className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-[#00e676] flex items-center gap-1 group-hover:translate-x-1 transition">
                    View Poll <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-white">Attendance Poll</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {matchMetrics.totalConfirmed} confirmed of {matchMetrics.targetSquadSize} needed.
                  1-tap RSVP for players with captain quick overrides.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md bg-[#090d12] px-2 py-0.5 text-xs text-zinc-300 border border-zinc-800">
                    {matchMetrics.femaleConfirmed}/{matchMetrics.minFemale} Women
                  </span>
                  <span className="rounded-md bg-[#090d12] px-2 py-0.5 text-xs text-zinc-300 border border-zinc-800">
                    {matchMetrics.playerShortage === 0 ? "Target Met" : `${matchMetrics.playerShortage} Short`}
                  </span>
                </div>
              </div>

              {/* Free Agent Sub Portal Glimpse Card */}
              <div
                onClick={() => handleOpenSubPortalWithFilter()}
                className="group cursor-pointer rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-6 transition-all hover:border-amber-500/60 hover:bg-[#161f2e] shadow-lg active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    Sub Pool <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-white">Free Agent & Sub Portal</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Find available subs by skill tier and female quota. 1-click WhatsApp/SMS match invites.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      matchMetrics.isReady
                        ? "bg-emerald-950/60 text-[#00e676] border border-emerald-800/40"
                        : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                    }`}
                  >
                    {matchMetrics.isReady ? "No Shortage" : "Shortage Alert"}
                  </span>
                </div>
              </div>

              {/* Tactical Pitch Glimpse Card */}
              <div
                onClick={() => setActiveTab("tactics")}
                className="group cursor-pointer rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-6 transition-all hover:border-teal-500/60 hover:bg-[#161f2e] shadow-lg active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                    Lineup Board <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="mt-4 text-base sm:text-lg font-bold text-white">{teamSettings.format} Lineup</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Visual pitch formation board (2-3-1, 3-2-1), position assignment, and bench rotation.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md bg-[#090d12] px-2 py-0.5 text-xs text-zinc-300 border border-zinc-800">
                    Formation 2-3-1
                  </span>
                  <span className="rounded-md bg-[#090d12] px-2 py-0.5 text-xs text-zinc-300 border border-zinc-800">
                    Bench Tracker
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Poll Section in Overview */}
            <div className="pt-2">
              <AttendancePoll onGoToSubs={() => handleOpenSubPortalWithFilter()} />
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Poll */}
        {activeTab === "poll" && (
          <AttendancePoll onGoToSubs={() => handleOpenSubPortalWithFilter()} />
        )}

        {/* Tab 4: Schedule */}
        {activeTab === "schedule" && <ScheduleList />}

        {/* Tab 5: Tactical Pitch */}
        {activeTab === "tactics" && <TacticalBoard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#090d12] py-6 text-center text-xs text-zinc-500 pb-20 md:pb-6">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">{teamSettings.name}</span>
            <span>•</span>
            <span className="text-zinc-400">NYC Footy Team Hub & Free Agent Portal</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="hidden sm:inline text-emerald-400/80 italic">
              Powered by Clerk Auth
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenShare}
              className="text-zinc-400 hover:text-[#00e676] transition"
            >
              WhatsApp Share
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLeagueAppsOpen(true)}
              className="text-zinc-400 hover:text-sky-400 transition"
            >
              LeagueApps Sync
            </button>
            <span>•</span>
            <button
              onClick={handleOpenSettings}
              className="text-zinc-400 hover:text-[#00e676] transition"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Profile & Onboarding Modal */}
      <OnboardingModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Captain Tools & Settings Modal */}
      <CaptainToolsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsDefaultTab}
      />

      {/* LeagueApps Live Sync Modal */}
      <LeagueAppsModal
        isOpen={isLeagueAppsOpen}
        onClose={() => setIsLeagueAppsOpen(false)}
      />
    </div>
  );
}

export default function TeamDashboard() {
  return (
    <TeamHubProvider>
      <TeamDashboardInner />
    </TeamHubProvider>
  );
}
