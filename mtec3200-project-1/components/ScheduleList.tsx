"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  Calendar,
  MapPin,
  Plus,
  ChevronRight,
  Sparkles,
  Shirt,
} from "lucide-react";

export const ScheduleList: React.FC = () => {
  const {
    matches,
    activeMatchId,
    setActiveMatchId,
    addMatch,
    seasonRecord,
    teamSettings,
  } = useTeamHub();

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);

  // New match form state
  const [newOpponent, setNewOpponent] = useState("");
  const [newWeek, setNewWeek] = useState(matches.length + 1);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("16:00");
  const [newLocation, setNewLocation] = useState("Bushwick Inlet Park (Williamsburg)");
  const [newField, setNewField] = useState("Field 1");
  const [newKitColor, setNewKitColor] = useState<"Light" | "Dark">("Light");
  const [newNotes, setNewNotes] = useState("");

  const upcomingMatches = matches
    .filter((m) => !m.score)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastMatches = matches
    .filter((m) => !!m.score)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponent.trim() || !newDate.trim()) return;

    // Default poll deadline: Friday 5pm before the match
    const matchDateObj = new Date(newDate + "T" + newTime);
    const deadlineDate = new Date(matchDateObj);
    deadlineDate.setDate(deadlineDate.getDate() - 2);
    deadlineDate.setHours(17, 0, 0, 0);

    addMatch({
      week: Number(newWeek),
      opponent: newOpponent,
      date: newDate,
      time: newTime,
      location: newLocation,
      fieldNumber: newField,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(newLocation)}`,
      kitColor: newKitColor,
      pollDeadline: deadlineDate.toISOString(),
      requiredPlayers: teamSettings.targetSquadSize,
      requiredFemalePlayers: teamSettings.minFemalePlayers,
      rsvps: {},
      subsConfirmed: [],
      notes: newNotes,
    });

    setIsAddMatchOpen(false);
    setNewOpponent("");
    setNewNotes("");
  };

  return (
    <div className="space-y-8">
      {/* Header & Season Record Card */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              NYC Footy Season Fixtures
            </div>
            <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Schedule & Standings
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              {teamSettings.division} • {teamSettings.format}
            </p>
          </div>

          <button
            onClick={() => setIsAddMatchOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/50 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Match</span>
          </button>
        </div>

        {/* Season Record KPIs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">PLAYED</div>
            <div className="text-2xl font-black text-white mt-0.5">{seasonRecord.played}</div>
          </div>
          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-3">
            <div className="text-[10px] font-bold text-emerald-400 uppercase">WINS</div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">{seasonRecord.won}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">DRAWS</div>
            <div className="text-2xl font-black text-zinc-300 mt-0.5">{seasonRecord.drawn}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">LOSSES</div>
            <div className="text-2xl font-black text-zinc-300 mt-0.5">{seasonRecord.lost}</div>
          </div>
          <div className="rounded-2xl border border-emerald-800/80 bg-emerald-950/50 p-3">
            <div className="text-[10px] font-bold text-emerald-400 uppercase">POINTS</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{seasonRecord.points}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">GOALS (F/A)</div>
            <div className="text-lg font-black text-white mt-1">
              {seasonRecord.goalsFor} : {seasonRecord.goalsAgainst}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === "upcoming"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Upcoming Matches ({upcomingMatches.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
            activeTab === "past"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Past Results ({pastMatches.length})
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {activeTab === "upcoming" && (
          <>
            {upcomingMatches.map((match) => {
              const isActive = match.id === activeMatchId;
              const dateObj = new Date(`${match.date}T${match.time}`);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              // Count confirmed
              const confirmedRoster = Object.values(match.rsvps).filter(
                (r) => r.status === "yes"
              ).length;
              const totalConfirmed = confirmedRoster + match.subsConfirmed.length;

              return (
                <div
                  key={match.id}
                  className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                    isActive
                      ? "border-emerald-500 bg-gradient-to-r from-zinc-900 to-zinc-950 ring-1 ring-emerald-500/50 shadow-xl"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Fixture Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                          Week {match.week}
                        </span>
                        {isActive && (
                          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                            Current Focus Match
                          </span>
                        )}
                      </div>

                      <h4 className="mt-2 text-xl font-bold text-white">
                        {teamSettings.name} vs {match.opponent}
                      </h4>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                          {formattedDate} @ {match.time}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                          {match.location} ({match.fieldNumber})
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1">
                          <Shirt className="h-3.5 w-3.5" />
                          {match.kitColor} Kit
                        </span>
                      </div>
                    </div>

                    {/* Confirmed Pill & Switch Action */}
                    <div className="flex items-center gap-3 self-start md:self-auto">
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">Confirmed Squad</div>
                        <div className="text-sm font-bold text-white">
                          {totalConfirmed} / {match.requiredPlayers} players
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveMatchId(match.id)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                        }`}
                      >
                        <span>{isActive ? "Active in Hub" : "Set Active"}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === "past" && (
          <>
            {pastMatches.map((match) => {
              if (!match.score) return null;
              const isWin = match.score.us > match.score.opponent;
              const isDraw = match.score.us === match.score.opponent;

              const dateObj = new Date(`${match.date}T${match.time}`);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={match.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-300">
                          Week {match.week}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-black uppercase ${
                            isWin
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isDraw
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isWin ? "Win" : isDraw ? "Draw" : "Loss"}
                        </span>
                      </div>

                      <h4 className="mt-2 text-lg font-bold text-white">
                        vs {match.opponent}
                      </h4>

                      <div className="mt-1 text-xs text-zinc-400 flex items-center gap-2">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{match.location}</span>
                      </div>

                      {match.notes && (
                        <p className="mt-2 text-xs text-zinc-300 italic bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
                          &ldquo;{match.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Final Score Display */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 border border-zinc-800">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">
                            {teamSettings.name.split(" ")[0]}
                          </div>
                          <div className="text-2xl font-black text-white">
                            {match.score.us}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-zinc-600">-</span>
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-zinc-400 uppercase">
                            Opp
                          </div>
                          <div className="text-2xl font-black text-zinc-400">
                            {match.score.opponent}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Add Match Modal */}
      {isAddMatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h4 className="text-xl font-bold text-white">Schedule New Fixture</h4>
            <p className="mt-1 text-xs text-zinc-400">
              Add an upcoming match from the official NYC Footy league schedule.
            </p>

            <form onSubmit={handleCreateMatch} className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Opponent Team
                  </label>
                  <input
                    type="text"
                    required
                    value={newOpponent}
                    onChange={(e) => setNewOpponent(e.target.value)}
                    placeholder="e.g. Astoria FC"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Week #
                  </label>
                  <input
                    type="number"
                    required
                    value={newWeek}
                    onChange={(e) => setNewWeek(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Pitch Location
                  </label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Bushwick Inlet Park (Williamsburg)">Bushwick Inlet Park</option>
                    <option value="Pier 40 (Hudson River Park)">Pier 40</option>
                    <option value="Brooklyn Bridge Park Pier 5">Brooklyn Bridge Park Pier 5</option>
                    <option value="Randall's Island">Randall&apos;s Island</option>
                    <option value="Octagon Park (Roosevelt Island)">Octagon Park</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Field Number
                  </label>
                  <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="e.g. Field 1 (Turf)"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Designated Kit
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="kit"
                      checked={newKitColor === "Light"}
                      onChange={() => setNewKitColor("Light")}
                      className="text-emerald-600"
                    />
                    Light Kit (Home)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="kit"
                      checked={newKitColor === "Dark"}
                      onChange={() => setNewKitColor("Dark")}
                      className="text-emerald-600"
                    />
                    Dark Kit (Away)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bring match ball, rain expected"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMatchOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
