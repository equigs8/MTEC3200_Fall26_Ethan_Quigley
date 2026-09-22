"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import { GenderCategory, Position, SkillLevel, UserRole } from "@/types/footy";
import { X, Check, Shield, User, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, activeRole, setActiveRole, isClerkSignedIn, clerkUser } =
    useTeamHub();

  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role || activeRole);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [gender, setGender] = useState<GenderCategory>(currentUser.gender || "male");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(currentUser.skillLevel || "P3");
  const [positions, setPositions] = useState<Position[]>(
    currentUser.preferredPositions || ["MID"]
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    currentUser.subAvailability?.isAvailable ?? true
  );
  const [boroughs, setBoroughs] = useState<string[]>(
    currentUser.subAvailability?.boroughs || ["Brooklyn"]
  );
  const [bio, setBio] = useState(currentUser.bio || "");

  // Sync state whenever modal opens or active user changes
  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setRole(currentUser.role || activeRole);
      setPhone(currentUser.phone || "");
      setGender(currentUser.gender || "male");
      setSkillLevel(currentUser.skillLevel || "P3");
      setPositions(currentUser.preferredPositions || ["MID"]);
      setIsAvailable(currentUser.subAvailability?.isAvailable ?? true);
      setBoroughs(currentUser.subAvailability?.boroughs || ["Brooklyn"]);
      setBio(currentUser.bio || "");
    }
  }, [currentUser, activeRole, isOpen]);

  if (!isOpen) return null;

  const togglePosition = (pos: Position) => {
    if (positions.includes(pos)) {
      if (positions.length > 1) {
        setPositions(positions.filter((p) => p !== pos));
      }
    } else {
      setPositions([...positions, pos]);
    }
  };

  const toggleBorough = (b: string) => {
    if (boroughs.includes(b)) {
      if (boroughs.length > 1) {
        setBoroughs(boroughs.filter((item) => item !== b));
      }
    } else {
      setBoroughs([...boroughs, b]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      role,
      phone,
      gender,
      skillLevel,
      preferredPositions: positions,
      bio,
      subAvailability: {
        isAvailable,
        boroughs,
        notes: isAvailable ? "Ready to sub for upcoming weekend games" : "",
      },
    });
    setActiveRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111823] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-[#00e676] border border-emerald-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">NYC Footy Player Profile</h3>
            <p className="text-xs text-zinc-400">
              Configure your role, skill tier, and sub availability
            </p>
          </div>
        </div>

        {/* Clerk Account Sync Badge */}
        {isClerkSignedIn && clerkUser && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#090d12] p-3 border border-emerald-500/30">
            {clerkUser.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt={currentUser.name}
                className="h-10 w-10 rounded-xl object-cover border border-emerald-400/40"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate">
                  {clerkUser.fullName || currentUser.name}
                </span>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-[#00e676] border border-emerald-500/30">
                  Clerk Linked
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 truncate block">
                {clerkUser.primaryEmailAddress?.emailAddress || "Authenticated User"}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Select Your Persona / Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "captain", label: "Captain 👑", desc: "Team Hub & Subs" },
                { id: "player", label: "Player ⚽", desc: "My Team RSVP" },
                { id: "free_agent", label: "Free Agent 🏃‍♀️", desc: "Sub Pool" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as UserRole)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    role === item.id
                      ? "border-emerald-500 bg-emerald-950/40 text-white font-bold shadow-md shadow-emerald-950/40"
                      : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 917-555-0142"
                className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender (Critical for NYC Footy Co-ed rule) */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Gender Category <span className="text-emerald-400 text-[11px]">(Co-ed 2+ female rule)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["female", "male", "non-binary"] as GenderCategory[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`capitalize py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    gender === g
                      ? "border-emerald-500 bg-emerald-950/40 text-white"
                      : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level (P1 to P5) */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              NYC Footy Skill Level
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { level: "P1", desc: "Novice" },
                { level: "P2", desc: "Casual" },
                { level: "P3", desc: "Intermediate" },
                { level: "P4", desc: "Competitive" },
                { level: "P5", desc: "Premier" },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setSkillLevel(item.level as SkillLevel)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition ${
                    skillLevel === item.level
                      ? "border-emerald-500 bg-emerald-950/50 text-white font-bold"
                      : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{item.level}</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Positions */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Preferred Positions
            </label>
            <div className="flex gap-2">
              {(["GK", "DEF", "MID", "FWD"] as Position[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => togglePosition(pos)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    positions.includes(pos)
                      ? "border-emerald-500 bg-emerald-500/20 text-[#00e676]"
                      : "border-zinc-800 bg-[#090d12] text-zinc-400 hover:text-white"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Availability Toggle */}
          <div className="rounded-2xl border border-zinc-800 bg-[#090d12] p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Available for Subbing in NYC Footy
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Appear in the Free Agent Portal so captains can recruit you for weekend games
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAvailable ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAvailable ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {isAvailable && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                  Available Boroughs:
                </span>
                <div className="flex gap-2">
                  {["Brooklyn", "Manhattan", "Queens"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBorough(b)}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition ${
                        boroughs.includes(b)
                          ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300 font-semibold"
                          : "border-zinc-800 bg-[#111823] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio / Experience */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Short Bio / Playing Experience
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="e.g. Played college soccer, solid first touch, good fitness..."
              className="w-full rounded-xl border border-zinc-700 bg-[#090d12] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
