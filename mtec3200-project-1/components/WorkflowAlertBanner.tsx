"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Play,
  UserCheck,
  UserX,
} from "lucide-react";
import { soundFx } from "@/lib/soundEffects";
import { triggerSquadReadyConfetti } from "@/lib/confetti";

interface WorkflowAlertBannerProps {
  onOpenSubPortalWithFilter?: (gender?: "female") => void;
}

export const WorkflowAlertBanner: React.FC<WorkflowAlertBannerProps> = ({
  onOpenSubPortalWithFilter,
}) => {
  const { activeAlerts, dismissAlert, simulatePollScenario, matchMetrics, activeMatch } =
    useTeamHub();
  const [showSimControls, setShowSimControls] = useState(false);

  if (!activeMatch) return null;

  const primaryAlert = activeAlerts[0];

  return (
    <div className="space-y-2">
      {/* Active Shortage / Urgency Alert Banner */}
      {primaryAlert ? (
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${
            primaryAlert.type === "female_shortage"
              ? "border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-[#181119] to-[#111823] text-rose-200"
              : "border-amber-500/50 bg-gradient-to-r from-amber-950/80 via-[#191612] to-[#111823] text-amber-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  primaryAlert.type === "female_shortage"
                    ? "border-rose-500/40 bg-rose-500/20 text-rose-400"
                    : "border-amber-500/40 bg-amber-500/20 text-amber-400"
                }`}
              >
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      primaryAlert.type === "female_shortage"
                        ? "bg-rose-500 text-white"
                        : "bg-amber-500 text-black"
                    }`}
                  >
                    {primaryAlert.type === "female_shortage"
                      ? "NYC Footy Rule Shortage"
                      : "Roster Shortage"}
                  </span>
                  <span className="text-xs font-semibold text-zinc-300">
                    Week {activeMatch.week} vs {activeMatch.opponent}
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-medium text-white">
                  {primaryAlert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() =>
                  onOpenSubPortalWithFilter?.(
                    primaryAlert.type === "female_shortage" ? "female" : undefined
                  )
                }
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
                  primaryAlert.type === "female_shortage"
                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/50"
                    : "bg-amber-600 hover:bg-amber-500 shadow-amber-950/50"
                }`}
              >
                <span>Find {primaryAlert.type === "female_shortage" ? "Female" : ""} Subs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => dismissAlert(primaryAlert.id)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00e676]" />
            <span className="font-semibold text-white">
              Squad Ready ({matchMetrics.totalConfirmed}/{matchMetrics.targetSquadSize} confirmed,{" "}
              {matchMetrics.femaleConfirmed}/{matchMetrics.minFemale} female rule met)
            </span>
          </div>
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            {showSimControls ? "Hide Workflow Simulator" : "Test Poll Drop-off Flow"}
          </button>
        </div>
      )}

      {/* Interactive Workflow Simulator (for demonstrating ideas.md requirements) */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0d131c] px-3 py-1.5 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
          <Play className="h-3 w-3 text-emerald-400" />
          <span>Workflow Testing:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              simulatePollScenario("female_drop");
              soundFx.playWhistle();
            }}
            className="rounded-lg bg-rose-950/60 border border-rose-800/40 px-2 py-1 text-[10px] font-semibold text-rose-300 hover:bg-rose-900/60 transition active:scale-95"
            title="Simulate a female player dropping out, triggering a co-ed shortage"
          >
            Simulate Female Drop-out
          </button>
          <button
            onClick={() => {
              simulatePollScenario("mass_drop");
              soundFx.playWhistle();
            }}
            className="rounded-lg bg-amber-950/60 border border-amber-800/40 px-2 py-1 text-[10px] font-semibold text-amber-300 hover:bg-amber-900/60 transition active:scale-95"
            title="Simulate multiple last-minute dropouts"
          >
            Simulate 3 Drop-outs
          </button>
          <button
            onClick={() => {
              simulatePollScenario("full_squad");
              soundFx.playSuccess();
              triggerSquadReadyConfetti();
            }}
            className="rounded-lg bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-900/60 transition active:scale-95"
            title="Simulate all squad members responding Yes"
          >
            Reset to Full Squad
          </button>
        </div>
      </div>
    </div>
  );
};
