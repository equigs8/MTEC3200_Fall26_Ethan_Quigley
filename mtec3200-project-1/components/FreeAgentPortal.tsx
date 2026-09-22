"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { GenderCategory, Position, SkillLevel, SubCandidate } from "@/types/footy";
import {
  UserPlus,
  MessageCircle,
  Phone,
  CheckCircle2,
  Filter,
  Sparkles,
  Star,
  MapPin,
  Shield,
  Clock,
  AlertTriangle,
  X,
  Plus,
  Zap,
} from "lucide-react";
import { triggerSquadReadyConfetti } from "@/lib/confetti";
import { soundFx } from "@/lib/soundEffects";

interface FreeAgentPortalProps {
  initialGenderFilter?: "female" | "all";
}

export const FreeAgentPortal: React.FC<FreeAgentPortalProps> = ({
  initialGenderFilter = "all",
}) => {
  const {
    subs,
    addSub,
    activeMatch,
    matchMetrics,
    triggerSubOutreach,
    confirmSubForMatch,
    removeSubFromMatch,
  } = useTeamHub();

  const [genderFilter, setGenderFilter] = useState<"all" | GenderCategory>(
    initialGenderFilter
  );
  const [skillFilter, setSkillFilter] = useState<"all" | SkillLevel>("all");
  const [positionFilter, setPositionFilter] = useState<"all" | Position>("all");
  const [boroughFilter, setBoroughFilter] = useState<string>("all");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New free agent registration form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState<GenderCategory>("female");
  const [newSkill, setNewSkill] = useState<SkillLevel>("P3");
  const [newPositions, setNewPositions] = useState<Position[]>(["MID"]);
  const [newBoroughs, setNewBoroughs] = useState<string[]>(["Brooklyn"]);
  const [newBio, setNewBio] = useState("");

  if (!activeMatch) return null;

  const handleOutreach = (subId: string, channel: "whatsapp" | "sms") => {
    soundFx.playPop();
    const url = triggerSubOutreach(subId, activeMatch.id, channel);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleRegisterSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addSub({
      name: newName.trim(),
      phone: newPhone.trim(),
      gender: newGender,
      skillLevel: newSkill,
      positions: newPositions,
      tier: 1,
      reliabilityScore: 5,
      boroughs: newBoroughs,
      statusForNextMatch: "uncontacted",
      bio: newBio.trim(),
      isAvailableForSubbing: true,
    });

    setIsRegisterModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewBio("");
  };

  const filteredSubs = subs.filter((sub) => {
    if (sub.isAvailableForSubbing === false) return false;
    if (genderFilter !== "all" && sub.gender !== genderFilter) return false;
    if (skillFilter !== "all" && sub.skillLevel !== skillFilter) return false;
    if (positionFilter !== "all" && !sub.positions.includes(positionFilter)) return false;
    if (boroughFilter !== "all" && !sub.boroughs?.includes(boroughFilter)) return false;
    return true;
  });

  const confirmedSubsList = subs.filter((s) => activeMatch.subsConfirmed.includes(s.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-[#111823] via-[#0f1722] to-[#131d2a] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-4 w-4 text-[#00e676]" />
              NYC Footy Community Sub Pool
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">
              Free Agent &amp; Sub Portal
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Alleviating the strains of free agent teams: recruit vetted players, satisfy the
              official 2+ female co-ed rule, and 1-click dispatch WhatsApp/SMS match invites.
            </p>
          </div>

          <div className="flex items-center gap-3.5 self-start md:self-auto shrink-0">
            {/* Visual Radar Scanner Element */}
            <div className="relative h-11 w-11 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 overflow-hidden flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0" title="Sub Radar Active • Scanning Brooklyn / Manhattan">
              <div className="absolute inset-1.5 rounded-full border border-emerald-500/20" />
              <div className="absolute inset-3 rounded-full border border-emerald-500/30" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/25 to-transparent animate-radar-sweep pointer-events-none" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]" />
              </span>
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>List as Free Agent</span>
            </button>
          </div>
        </div>

        {/* Current Match Shortage Diagnostic */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#090d12] p-4 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                matchMetrics.femaleShortage > 0
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-[#00e676] border border-emerald-500/30"
              }`}
            >
              {matchMetrics.femaleShortage > 0 ? (
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Week {activeMatch.week} vs {activeMatch.opponent}
                </span>
                <span className="text-xs text-zinc-400">• {activeMatch.time} at {activeMatch.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs font-bold ${
                    matchMetrics.femaleShortage > 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {matchMetrics.femaleConfirmed}/{matchMetrics.minFemale} Female Players Confirmed
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-300">
                  {matchMetrics.totalConfirmed}/{matchMetrics.targetSquadSize} Total Squad
                </span>
              </div>
            </div>
          </div>

          {matchMetrics.femaleShortage > 0 && (
            <button
              onClick={() => {
                setGenderFilter("female");
                setSkillFilter("all");
              }}
              className="rounded-xl border border-rose-500/50 bg-rose-950/40 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Show Available Female Subs</span>
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white">
                Need {matchMetrics.femaleShortage}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111823] p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Female Rule Shortcut */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGenderFilter(genderFilter === "female" ? "all" : "female")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                genderFilter === "female"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/50"
                  : "bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40"
              }`}
            >
              <span>♀ Female Subs Only (Co-ed Quota)</span>
            </button>
            <button
              onClick={() => {
                setGenderFilter("all");
                setSkillFilter("all");
                setPositionFilter("all");
                setBoroughFilter("all");
              }}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Reset Filters
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Skill Level */}
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as any)}
              className="rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">All Skill Levels</option>
              <option value="P1">P1 - Novice</option>
              <option value="P2">P2 - Casual</option>
              <option value="P3">P3 - Intermediate</option>
              <option value="P4">P4 - Competitive</option>
              <option value="P5">P5 - Premier</option>
            </select>

            {/* Position */}
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as any)}
              className="rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">All Positions</option>
              <option value="GK">Goalkeeper (GK)</option>
              <option value="DEF">Defender (DEF)</option>
              <option value="MID">Midfielder (MID)</option>
              <option value="FWD">Forward (FWD)</option>
            </select>

            {/* Borough */}
            <select
              value={boroughFilter}
              onChange={(e) => setBoroughFilter(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-1.5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">All Boroughs</option>
              <option value="Brooklyn">Brooklyn</option>
              <option value="Manhattan">Manhattan</option>
              <option value="Queens">Queens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirmed Subs Section (if any accepted) */}
      {confirmedSubsList.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Confirmed Subs for Match {activeMatch.week} ({confirmedSubsList.length})
            </h4>
            <span className="text-xs text-zinc-400">Added to Match Roster</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {confirmedSubsList.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl bg-[#090d12] p-3 border border-emerald-800/40"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{sub.name}</span>
                    <span className="text-[10px] text-zinc-400">({sub.gender})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {sub.skillLevel || "P3"} • {sub.positions.join("/")}
                  </span>
                </div>
                <button
                  onClick={() => removeSubFromMatch(sub.id, activeMatch.id)}
                  className="rounded-lg bg-zinc-800 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:bg-rose-950/60 hover:text-rose-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubs.map((sub) => {
          const isConfirmed = activeMatch.subsConfirmed.includes(sub.id);

          return (
            <div
              key={sub.id}
              className={`rounded-3xl border bg-[#111823] p-5 shadow-xl transition-all flex flex-col justify-between ${
                sub.gender === "female"
                  ? "border-rose-950/60 hover:border-rose-500/60"
                  : "border-zinc-800 hover:border-emerald-500/60"
              }`}
            >
              <div>
                {/* Top Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          sub.gender === "female"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {sub.gender === "female" ? "♀ Female Sub" : sub.gender}
                      </span>
                      <span className="rounded-md bg-emerald-500/20 text-[#00e676] px-1.5 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                        {sub.skillLevel || "P3"} Division
                      </span>
                      <span className="rounded-md bg-zinc-800/80 text-zinc-300 px-1.5 py-0.5 text-[10px] font-semibold">
                        {sub.positions.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold">{sub.reliabilityScore}.0</span>
                  </div>
                </div>

                {/* Bio / Experience */}
                {sub.bio && (
                  <p className="mt-3 text-xs text-zinc-300 leading-relaxed bg-[#090d12] p-2.5 rounded-xl border border-zinc-800/80">
                    &ldquo;{sub.bio}&rdquo;
                  </p>
                )}

                {/* Boroughs & Meta */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-sky-400" />
                    {sub.boroughs?.join(", ") || "NYC"}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Clock className="h-3 w-3" />
                    Available Sunday
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOutreach(sub.id, "whatsapp")}
                    className="flex items-center gap-1 rounded-xl bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition"
                    title="Send pre-filled WhatsApp sub invitation"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#00e676]" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleOutreach(sub.id, "sms")}
                    className="flex items-center gap-1 rounded-xl bg-sky-950/60 border border-sky-800/50 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/60 hover:text-white transition"
                    title="Send SMS invite"
                  >
                    <Phone className="h-3.5 w-3.5 text-sky-400" />
                    <span>SMS</span>
                  </button>
                </div>

                {isConfirmed ? (
                  <button
                    onClick={() => {
                      removeSubFromMatch(sub.id, activeMatch.id);
                      soundFx.playPop();
                    }}
                    className="rounded-xl bg-emerald-600/30 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-rose-950/60 hover:text-rose-300 transition active:scale-95"
                  >
                    ✓ Confirmed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      confirmSubForMatch(sub.id, activeMatch.id);
                      soundFx.playSuccess();
                      triggerSquadReadyConfetti();
                    }}
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/40 transition active:scale-95"
                  >
                    Add to Squad
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubs.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-[#111823] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-white">No Free Agents match this filter</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Try adjusting your skill level or borough filters to see more available candidates.
          </p>
          <button
            onClick={() => {
              setGenderFilter("all");
              setSkillFilter("all");
              setPositionFilter("all");
              setBoroughFilter("all");
            }}
            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
          >
            Show All Free Agents
          </button>
        </div>
      )}

      {/* Free Agent Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111823] p-6 shadow-2xl">
            <button
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-[#00e676] border border-emerald-500/30">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">List as an NYC Footy Free Agent</h3>
                <p className="text-xs text-zinc-400">
                  Join the sub pool so local captains can reach out for upcoming matches
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterSub} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    placeholder="e.g. 917-555-0144"
                    className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["female", "male", "non-binary"] as GenderCategory[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewGender(g)}
                      className={`capitalize py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                        newGender === g
                          ? "border-emerald-500 bg-emerald-950/40 text-white"
                          : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Skill Division</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["P1", "P2", "P3", "P4", "P5"] as SkillLevel[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewSkill(s)}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition ${
                        newSkill === s
                          ? "border-emerald-500 bg-emerald-950/50 text-white"
                          : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Positions</label>
                <div className="flex gap-2">
                  {(["GK", "DEF", "MID", "FWD"] as Position[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => {
                        if (newPositions.includes(pos)) {
                          if (newPositions.length > 1) {
                            setNewPositions(newPositions.filter((p) => p !== pos));
                          }
                        } else {
                          setNewPositions([...newPositions, pos]);
                        }
                      }}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        newPositions.includes(pos)
                          ? "border-emerald-500 bg-emerald-500/20 text-[#00e676]"
                          : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Bio / Notes</label>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="e.g. Played college soccer, reliable, down for Sunday afternoon games in Brooklyn..."
                  rows={2}
                  className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 transition active:scale-95"
                >
                  Join Sub Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
