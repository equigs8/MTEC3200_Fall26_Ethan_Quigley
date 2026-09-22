"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  Settings,
  Share2,
  Copy,
  Check,
  RotateCcw,
  X,
  Users,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { GenderCategory, Position } from "@/types/footy";

interface CaptainToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "settings" | "share" | "roster";
}

export const CaptainToolsModal: React.FC<CaptainToolsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "settings",
}) => {
  const {
    teamSettings,
    updateTeamSettings,
    players,
    addPlayer,
    deletePlayer,
    activeMatch,
    resetAllData,
  } = useTeamHub();

  const [activeTab, setActiveTab] = useState<"settings" | "share" | "roster">(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Settings form local state
  const [teamName, setTeamName] = useState(teamSettings.name);
  const [leagueName, setLeagueName] = useState(teamSettings.leagueName);
  const [division, setDivision] = useState(teamSettings.division);
  const [format, setFormat] = useState<"7v7" | "8v8" | "11v11">(teamSettings.format);
  const [targetSquadSize, setTargetSquadSize] = useState(teamSettings.targetSquadSize);
  const [minFemalePlayers, setMinFemalePlayers] = useState(teamSettings.minFemalePlayers);
  const [homeKitColor, setHomeKitColor] = useState(teamSettings.homeKitColor);
  const [awayKitColor, setAwayKitColor] = useState(teamSettings.awayKitColor);
  const [captainName, setCaptainName] = useState(teamSettings.captainName);
  const [captainPhone, setCaptainPhone] = useState(teamSettings.captainPhone);

  // New player form state
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState<number | "">("");
  const [newPlayerGender, setNewPlayerGender] = useState<GenderCategory>("male");
  const [newPlayerPos, setNewPlayerPos] = useState<Position>("MID");

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeamSettings({
      name: teamName,
      leagueName,
      division,
      format,
      targetSquadSize: Number(targetSquadSize),
      minFemalePlayers: Number(minFemalePlayers),
      homeKitColor,
      awayKitColor,
      captainName,
      captainPhone,
    });
    onClose();
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    addPlayer({
      name: newPlayerName,
      number: newPlayerNumber ? Number(newPlayerNumber) : undefined,
      gender: newPlayerGender,
      preferredPositions: [newPlayerPos],
    });

    setNewPlayerName("");
    setNewPlayerNumber("");
  };

  // Pre-formatted messages for WhatsApp
  const matchDate = activeMatch
    ? new Date(`${activeMatch.date}T${activeMatch.time}`)
    : new Date();
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const pollDeadlineFormatted = activeMatch
    ? new Date(activeMatch.pollDeadline).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "";

  const pollAnnouncementText = activeMatch
    ? `⚽ *NYC FOOTY MATCH ALERT - WEEK ${activeMatch.week}*\n` +
      `🆚 *vs ${activeMatch.opponent}*\n` +
      `📅 *Date:* ${formattedDate} @ ${activeMatch.time} EDT\n` +
      `📍 *Location:* ${activeMatch.location} (${activeMatch.fieldNumber})\n` +
      `👕 *Kit:* Wear ${activeMatch.kitColor} Kit\n` +
      (activeMatch.subwayInfo ? `🚇 *Transit:* ${activeMatch.subwayInfo}\n` : "") +
      `\n🗳️ *Please RSVP by ${pollDeadlineFormatted}* on our Team Hub:\n` +
      `https://nycfootyhub.com\n\n` +
      `Definitive responses only please so we know if we need to call subs! 🙏`
    : "";

  const emergencySubText = activeMatch
    ? `🚨 *EMERGENCY SUB CALL - NYC FOOTY CO-ED*\n` +
      `Our team (${teamSettings.name}) is short for this Sunday's game:\n` +
      `📅 ${formattedDate} @ ${activeMatch.time}\n` +
      `📍 ${activeMatch.location}\n` +
      `👕 Kit: ${activeMatch.kitColor}\n` +
      `We need 1-2 subs (female player needed for co-ed quota). If anyone is free, let me know ASAP! ⚽`
    : "";

  const gamedayReminderText = activeMatch
    ? `🔥 *GAME DAY REMINDER - Week ${activeMatch.week}*\n` +
      `Match vs ${activeMatch.opponent} today at ${activeMatch.time}!\n` +
      `📍 ${activeMatch.location} (${activeMatch.fieldNumber})\n` +
      `👕 Kit: Wear ${activeMatch.kitColor} (bring alternate just in case)\n` +
      `Please arrive 15 minutes early for warmup. Let's get the 3 points! ⚽💨`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Captain&apos;s Toolbox</h3>
              <p className="text-xs text-zinc-400">
                Team configuration, roster, and WhatsApp broadcasts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-5 flex gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Team Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "share"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp Broadcasts</span>
          </button>
          <button
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "roster"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team Roster ({players.length})</span>
          </button>
        </div>

        {/* Tab Content: Settings */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  League
                </label>
                <input
                  type="text"
                  required
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Division
                </label>
                <input
                  type="text"
                  required
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as "7v7" | "8v8" | "11v11")}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="7v7">7v7 (Default NYC Footy)</option>
                  <option value="8v8">8v8</option>
                  <option value="11v11">11v11</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Target Squad Size
                </label>
                <input
                  type="number"
                  min={7}
                  max={20}
                  value={targetSquadSize}
                  onChange={(e) => setTargetSquadSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Min Women on Field
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={minFemalePlayers}
                  onChange={(e) => setMinFemalePlayers(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Home Kit Color
                </label>
                <input
                  type="text"
                  value={homeKitColor}
                  onChange={(e) => setHomeKitColor(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Away Kit Color
                </label>
                <input
                  type="text"
                  value={awayKitColor}
                  onChange={(e) => setAwayKitColor(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Captain Name
                </label>
                <input
                  type="text"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Captain Phone
                </label>
                <input
                  type="text"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={resetAllData}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Data</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab Content: Share WhatsApp Templates */}
        {activeTab === "share" && (
          <div className="mt-6 space-y-6">
            <p className="text-xs text-zinc-400">
              Click to copy pre-formatted WhatsApp announcement messages directly into your team group chat.
            </p>

            {/* Template 1: Weekly Poll */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>WEEKLY POLL ANNOUNCEMENT</span>
                </div>
                <button
                  onClick={() => handleCopyText(pollAnnouncementText, "poll")}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  {copiedKey === "poll" ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Text
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                {pollAnnouncementText}
              </pre>
            </div>

            {/* Template 2: Emergency Sub Call */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>EMERGENCY SUB CALLOUT</span>
                </div>
                <button
                  onClick={() => handleCopyText(emergencySubText, "sub")}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-500 transition"
                >
                  {copiedKey === "sub" ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Text
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                {emergencySubText}
              </pre>
            </div>

            {/* Template 3: Matchday Reminder */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <MessageCircle className="h-4 w-4" />
                  <span>GAMEDAY FINAL REMINDER</span>
                </div>
                <button
                  onClick={() => handleCopyText(gamedayReminderText, "reminder")}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  {copiedKey === "reminder" ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Text
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                {gamedayReminderText}
              </pre>
            </div>
          </div>
        )}

        {/* Tab Content: Roster Management */}
        {activeTab === "roster" && (
          <div className="mt-6 space-y-6">
            {/* Add Player Form */}
            <form onSubmit={handleAddPlayer} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs font-bold text-white mb-3">Add Teammate to Roster</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <select
                    value={newPlayerGender}
                    onChange={(e) => setNewPlayerGender(e.target.value as GenderCategory)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>
                <div>
                  <select
                    value={newPlayerPos}
                    onChange={(e) => setNewPlayerPos(e.target.value as Position)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FWD">Forward</option>
                    <option value="GK">Goalkeeper</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Player</span>
                </button>
              </div>
            </form>

            {/* Current Roster List */}
            <div className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              {players.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300">
                      {p.number ? `#${p.number}` : "⚽"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {p.isCaptain && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                            Captain
                          </span>
                        )}
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            p.gender === "female"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {p.gender === "female" ? "F" : "M"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Pos: {p.preferredPositions.join(", ")}
                      </div>
                    </div>
                  </div>

                  {!p.isCaptain && (
                    <button
                      onClick={() => deletePlayer(p.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      title="Remove from roster"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
