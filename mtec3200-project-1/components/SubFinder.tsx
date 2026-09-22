"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { GenderCategory, Position } from "@/types/footy";
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  Plus,
  Star,
  Shield,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export const SubFinder: React.FC = () => {
  const {
    activeMatch,
    subs,
    addSub,
    triggerSubOutreach,
    confirmSubForMatch,
    removeSubFromMatch,
    matchMetrics,
  } = useTeamHub();

  const [filterGender, setFilterGender] = useState<"all" | GenderCategory>("all");
  const [filterTier, setFilterTier] = useState<number | "all">("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New sub form state
  const [newSubName, setNewSubName] = useState("");
  const [newSubPhone, setNewSubPhone] = useState("");
  const [newSubGender, setNewSubGender] = useState<GenderCategory>("male");
  const [newSubPositions, setNewSubPositions] = useState<Position[]>(["MID"]);
  const [newSubTier, setNewSubTier] = useState<1 | 2 | 3>(1);
  const [newSubNotes, setNewSubNotes] = useState("");

  if (!activeMatch) return null;

  // Handle outreach click
  const handleOutreach = (subId: string, channel: "whatsapp" | "sms") => {
    const url = triggerSubOutreach(subId, activeMatch.id, channel);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubPhone.trim()) return;

    addSub({
      name: newSubName,
      phone: newSubPhone,
      gender: newSubGender,
      positions: newSubPositions,
      tier: newSubTier,
      reliabilityScore: 5,
      statusForNextMatch: "uncontacted",
      notes: newSubNotes,
    });

    setIsAddModalOpen(false);
    setNewSubName("");
    setNewSubPhone("");
    setNewSubNotes("");
  };

  // Filtered subs
  const filteredSubs = subs.filter((sub) => {
    if (filterGender !== "all" && sub.gender !== filterGender) return false;
    if (filterTier !== "all" && sub.tier !== filterTier) return false;
    if (filterPosition !== "all" && !sub.positions.includes(filterPosition as Position)) {
      return false;
    }
    return true;
  });

  // Confirmed subs for this match
  const confirmedSubsList = subs.filter((s) => activeMatch.subsConfirmed.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Sub Pipeline Header & Shortage Diagnostic */}
      <div className="rounded-3xl border border-zinc-800/80 bg-[#111823] p-5 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
              Automated Sub Dispatcher
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-black text-white">
              Sub Outreach Pipeline
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Never scramble last-minute. 1-click WhatsApp & SMS contact with prioritized subs.
            </p>
          </div>

          {/* Quick Add Sub Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-950/50 self-start md:self-auto active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Sub to Pool</span>
          </button>
        </div>

        {/* Shortage Diagnostic Banner */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12] p-4">
            <div className="text-xs font-semibold text-zinc-400">STATUS DIAGNOSTIC</div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {matchMetrics.isReady ? (
                <span className="text-[#00e676] flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5" /> Full Squad
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-5 w-5" /> Need {matchMetrics.playerShortage} Sub(s)
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {matchMetrics.totalConfirmed} confirmed of {matchMetrics.targetSquadSize} needed
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              matchMetrics.femaleShortage > 0
                ? "border-amber-700/80 bg-amber-950/30"
                : "border-zinc-800/80 bg-[#090d12]"
            }`}
          >
            <div className="text-xs font-semibold text-zinc-400">NYC FOOTY CO-ED RULE</div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-white">
              {matchMetrics.femaleConfirmed} / {matchMetrics.minFemale} Women
            </div>
            <div className="text-xs mt-1">
              {matchMetrics.femaleShortage > 0 ? (
                <span className="text-amber-300 font-semibold">
                  ⚠️ Priority: Reach out to female subs below
                </span>
              ) : (
                <span className="text-[#00e676]">✓ Gender balance met</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-[#090d12] p-4">
            <div className="text-xs font-semibold text-zinc-400">CONFIRMED SUBS ON ROSTER</div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-white">
              {confirmedSubsList.length} Active
            </div>
            <div className="text-xs text-zinc-400 mt-1 truncate">
              {confirmedSubsList.length > 0
                ? confirmedSubsList.map((s) => s.name.split(" ")[0]).join(", ")
                : "No subs locked in yet"}
            </div>
          </div>
        </div>

        {/* Co-ed Rule Prompt Action */}
        {matchMetrics.femaleShortage > 0 && (
          <div className="mt-4 rounded-xl bg-purple-950/50 border border-purple-800/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400 shrink-0" />
              <span>
                To satisfy NYC Footy 7v7 co-ed balance, reach out to female subs first.
              </span>
            </div>
            <button
              onClick={() => setFilterGender("female")}
              className="font-bold underline text-purple-300 hover:text-white shrink-0"
            >
              Filter Women Subs
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-[#111823] p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterGender("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterGender === "all" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterGender("female")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterGender === "female"
                  ? "bg-purple-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Women
            </button>
            <button
              onClick={() => setFilterGender("male")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterGender === "male"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Men
            </button>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-[#111823] p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterTier("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterTier === "all" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setFilterTier(1)}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterTier === 1 ? "bg-emerald-600 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Tier 1
            </button>
            <button
              onClick={() => setFilterTier(2)}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterTier === 2 ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Tier 2
            </button>
          </div>

          {/* Position Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-[#111823] p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterPosition("all")}
              className={`rounded-lg px-2 py-1 font-medium transition ${
                filterPosition === "all" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              All
            </button>
            {["GK", "DEF", "MID", "FWD"].map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPosition(pos)}
                className={`rounded-lg px-2 py-1 font-medium transition ${
                  filterPosition === pos ? "bg-emerald-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-zinc-400">
          Showing {filteredSubs.length} of {subs.length} subs in pool
        </div>
      </div>

      {/* Sub Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubs.map((sub) => {
          const isConfirmed = activeMatch.subsConfirmed.includes(sub.id);
          const isContacted = sub.statusForNextMatch === "contacted";

          return (
            <div
              key={sub.id}
              className={`rounded-3xl border p-4 sm:p-5 transition-all relative overflow-hidden ${
                isConfirmed
                  ? "border-emerald-500/70 bg-gradient-to-b from-emerald-950/40 to-[#090d12] ring-1 ring-emerald-500/40"
                  : isContacted
                  ? "border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-[#090d12]"
                  : "border-zinc-800/80 bg-[#111823] hover:border-zinc-700"
              }`}
            >
              {/* Top Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl overflow-hidden bg-zinc-800 flex items-center justify-center text-sm font-bold text-white shrink-0 border border-zinc-700/60">
                    {sub.avatar ? (
                      <img src={sub.avatar} alt={sub.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{sub.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-bold text-white">{sub.name}</h4>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          sub.gender === "female"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {sub.gender === "female" ? "Woman" : "Man"}
                      </span>
                      <span className="rounded bg-[#090d12] px-1.5 py-0.2 text-[10px] font-semibold text-zinc-300 border border-zinc-800">
                        Tier {sub.tier}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-zinc-300 font-medium">
                        Pos: {sub.positions.join(", ")}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {sub.reliabilityScore}.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Pill */}
                <div>
                  {isConfirmed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-[#00e676] border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Playing
                    </span>
                  ) : isContacted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 animate-pulse">
                      <Clock className="h-3.5 w-3.5" /> Waiting Reply
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#090d12] px-2.5 py-1 text-xs font-medium text-zinc-400 border border-zinc-800">
                      Available
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {sub.notes && (
                <p className="mt-3 text-xs text-zinc-400 bg-[#090d12] p-2.5 rounded-xl border border-zinc-800/80">
                  {sub.notes}
                </p>
              )}

              {/* Contact and Actions Row */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs text-zinc-400 font-mono">
                  {sub.phone}
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Direct Dispatch */}
                  <button
                    onClick={() => handleOutreach(sub.id, "whatsapp")}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition shadow-sm active:scale-95"
                    title="Open WhatsApp with pre-filled match invite"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {/* SMS Text */}
                  <button
                    onClick={() => handleOutreach(sub.id, "sms")}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition active:scale-95"
                    title="Send SMS"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>SMS</span>
                  </button>

                  {/* Lock In / Remove Confirmation */}
                  {isConfirmed ? (
                    <button
                      onClick={() => removeSubFromMatch(sub.id, activeMatch.id)}
                      className="rounded-xl border border-rose-900 bg-rose-950/60 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900 active:scale-95"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => confirmSubForMatch(sub.id, activeMatch.id)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-sm active:scale-95"
                    >
                      Confirm In
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sub Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111823] p-6 shadow-2xl">
            <h4 className="text-xl font-bold text-white">Add New Substitute</h4>
            <p className="mt-1 text-xs text-zinc-400">
              Add someone to your team&apos;s sub directory for fast outreach when players drop out.
            </p>

            <form onSubmit={handleCreateSub} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Taylor Smith"
                  className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubPhone}
                    onChange={(e) => setNewSubPhone(e.target.value)}
                    placeholder="e.g. 917-555-0199"
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Gender Category
                  </label>
                  <select
                    value={newSubGender}
                    onChange={(e) => setNewSubGender(e.target.value as GenderCategory)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="female">Female (Co-ed Eligible)</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Primary Position
                  </label>
                  <select
                    value={newSubPositions[0]}
                    onChange={(e) => setNewSubPositions([e.target.value as Position])}
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="MID">Midfielder (MID)</option>
                    <option value="DEF">Defender (DEF)</option>
                    <option value="FWD">Forward / Striker (FWD)</option>
                    <option value="GK">Goalkeeper (GK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newSubTier}
                    onChange={(e) => setNewSubTier(Number(e.target.value) as 1 | 2 | 3)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1}>Tier 1: Go-to starter</option>
                    <option value={2}>Tier 2: Reliable friend</option>
                    <option value={3}>Tier 3: Emergency contact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newSubNotes}
                  onChange={(e) => setNewSubNotes(e.target.value)}
                  placeholder="e.g. Lives in Williamsburg, plays college ball, needs 1 day heads up"
                  className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition"
                >
                  Save Sub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
