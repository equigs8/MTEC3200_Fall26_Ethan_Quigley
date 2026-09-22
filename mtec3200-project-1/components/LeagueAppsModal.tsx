"use client";

import React, { useState } from "react";
import { useTeamHub } from "@/context/TeamHubContext";
import {
  RefreshCw,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Link2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { parseLeagueAppsIcs } from "@/lib/leagueapps";
import { GenderCategory } from "@/types/footy";

interface LeagueAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueAppsModal: React.FC<LeagueAppsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { teamSettings, syncLeagueAppsMatches, addPlayer, replaceRoster } = useTeamHub();

  const [activeTab, setActiveTab] = useState<"calendar" | "roster">("calendar");
  const [importMode, setImportMode] = useState<"replace" | "append">("replace");
  const [feedUrl, setFeedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Roster CSV paste state
  const [rosterCsvText, setRosterCsvText] = useState("");
  const [rosterSuccess, setRosterSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/leagueapps/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedUrl: feedUrl.trim(),
          teamName: teamSettings.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync with LeagueApps");
      }

      if (data.events && data.events.length > 0) {
        syncLeagueAppsMatches(data.events, data.detectedTeamName);
        setSuccessMessage(
          `Successfully synced ${data.events.length} match fixture(s)${
            data.detectedTeamName ? ` and set team name to "${data.detectedTeamName}"` : ""
          } from your NYC Footy LeagueApps calendar!`
        );
      } else {
        setErrorMessage("No upcoming matches were found in this calendar feed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to LeagueApps";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample NYC Footy demo feed loader
  const handleLoadSampleFeed = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Realistic sample LeagueApps ICS content
    const sampleIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LeagueApps//NYC Footy LeagueApps Calendar//EN
BEGIN:VEVENT
UID:la-game-101
SUMMARY:Bushwick Borough FC vs Williamsburg Wolves
DTSTART:20261018T160000Z
LOCATION:Bushwick Inlet Park - Field 1
DESCRIPTION:NYC Footy P3 Co-ed Sunday. Kit: Light
END:VEVENT
BEGIN:VEVENT
UID:la-game-102
SUMMARY:DUMBO Dynamo vs Bushwick Borough FC
DTSTART:20261025T173000Z
LOCATION:Brooklyn Bridge Park Pier 5 - Field 2
DESCRIPTION:NYC Footy P3 Co-ed Sunday. Kit: Dark
END:VEVENT
BEGIN:VEVENT
UID:la-game-103
SUMMARY:Bushwick Borough FC vs Chelsea Kickers
DTSTART:20261101T150000Z
LOCATION:Pier 40 (Hudson River Park) - Courtyard Field
DESCRIPTION:NYC Footy P3 Co-ed Sunday. Kit: Light
END:VEVENT
END:VCALENDAR`;

    setTimeout(() => {
      const parseResult = parseLeagueAppsIcs(sampleIcs, teamSettings.name);
      syncLeagueAppsMatches(parseResult.events, parseResult.detectedTeamName);
      setIsLoading(false);
      setSuccessMessage(
        `Successfully imported ${parseResult.events.length} official fixtures and set team name to "${parseResult.detectedTeamName}"!`
      );
    }, 400);
  };

  // Import Roster CSV (supports "First Name","Last Name" and custom columns)
  const handleImportRosterCsv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterCsvText.trim()) return;

    try {
      const lines = rosterCsvText.trim().split(/\r?\n/);
      const parsedPlayers: {
        name: string;
        number?: number;
        gender: GenderCategory;
        isCaptain?: boolean;
      }[] = [];

      const femaleNames = new Set([
        "mariama",
        "eris",
        "halley",
        "sarah",
        "maya",
        "chloe",
        "emma",
        "olivia",
        "jessica",
        "sophia",
        "emily",
        "anna",
        "lauren",
        "katie",
        "rachel",
      ]);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Match CSV cells respecting quotes: e.g. "Mariama","Bah" or Mariama,Bah
        const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g);
        if (!matches) continue;

        const cells = matches.map((m) => {
          let val = m.replace(/^,/, "").trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          return val.trim();
        });

        if (cells.length === 0) continue;

        // Skip header row
        if (
          cells[0].toLowerCase().includes("first name") ||
          cells[0].toLowerCase() === "firstname" ||
          cells[0].toLowerCase() === "name" ||
          cells[0].toLowerCase() === "player"
        ) {
          continue;
        }

        let fullName = "";
        let jersey: number | undefined = undefined;
        let gender: GenderCategory = "male";

        if (cells.length >= 2 && !cells[1].match(/^\d+$/)) {
          // Standard LeagueApps format: "First Name", "Last Name"
          const firstName = cells[0];
          const lastName = cells[1];
          fullName = `${firstName} ${lastName}`.trim();

          if (cells.length >= 3 && !isNaN(Number(cells[2]))) {
            jersey = Number(cells[2]);
          }
          if (cells.length >= 4) {
            const gRaw = cells[3].toLowerCase();
            if (gRaw.startsWith("f") || gRaw.includes("woman")) gender = "female";
            else if (gRaw.includes("non")) gender = "non-binary";
          } else if (femaleNames.has(firstName.toLowerCase())) {
            gender = "female";
          }
        } else {
          // Single name column or Name, Number, Gender
          fullName = cells[0];
          if (cells[1] && !isNaN(Number(cells[1]))) {
            jersey = Number(cells[1]);
          }
          if (cells[2]) {
            const gRaw = cells[2].toLowerCase();
            if (gRaw.startsWith("f") || gRaw.includes("woman")) gender = "female";
            else if (gRaw.includes("non")) gender = "non-binary";
          } else {
            const firstName = fullName.split(" ")[0].toLowerCase();
            if (femaleNames.has(firstName)) gender = "female";
          }
        }

        if (fullName) {
          const isCaptain =
            fullName.toLowerCase().includes(teamSettings.captainName.toLowerCase()) ||
            fullName.toLowerCase() === "ethan quigley";

          parsedPlayers.push({
            name: fullName,
            number: jersey,
            gender,
            isCaptain,
          });
        }
      }

      if (parsedPlayers.length === 0) {
        setErrorMessage("No valid player rows found in the CSV text.");
        return;
      }

      if (importMode === "replace") {
        replaceRoster(
          parsedPlayers.map((p) => ({
            name: p.name,
            number: p.number,
            gender: p.gender,
            preferredPositions: ["MID"],
            isCaptain: p.isCaptain,
          }))
        );
        setRosterSuccess(
          `Successfully replaced roster with ${parsedPlayers.length} players from your LeagueApps CSV!`
        );
      } else {
        parsedPlayers.forEach((p) => {
          addPlayer({
            name: p.name,
            number: p.number,
            gender: p.gender,
            preferredPositions: ["MID"],
            isCaptain: p.isCaptain,
          });
        });
        setRosterSuccess(`Successfully added ${parsedPlayers.length} players to your team roster!`);
      }

      setRosterCsvText("");
    } catch {
      setErrorMessage("Could not parse CSV format. Please check the columns.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm border border-blue-400/30 shadow-lg">
              LA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">NYC Footy / LeagueApps Sync</h3>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  Live Connect
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sync matches, pitches, and rosters directly from your LeagueApps account
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

        {/* Tab Switcher */}
        <div className="mt-5 flex gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "calendar"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar Subscription Feed</span>
          </button>
          <button
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "roster"
                ? "bg-blue-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Roster CSV Import</span>
          </button>
        </div>

        {/* Tab 1: Calendar Sync */}
        {activeTab === "calendar" && (
          <div className="mt-6 space-y-6">
            {/* Step-by-Step Instructions */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4" />
                  HOW TO GET YOUR LEAGUEAPPS CALENDAR LINK (3 STEPS)
                </span>
                <a
                  href="https://nycfooty.leagueapps.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-zinc-400 hover:text-blue-300"
                >
                  <span>Open LeagueApps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <ol className="space-y-2.5 text-xs text-zinc-300 list-decimal list-inside">
                <li>
                  Log in to{" "}
                  <strong className="text-white">nycfooty.leagueapps.com</strong> and click on your
                  profile / dashboard.
                </li>
                <li>
                  Find your team under{" "}
                  <span className="text-emerald-400 font-semibold">
                    &ldquo;My Registered Activities&rdquo;
                  </span>{" "}
                  and click on your team name.
                </li>
                <li>
                  Click the{" "}
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-bold text-white border border-zinc-700">
                    &ldquo;Subscribe to Calendar&rdquo;
                  </span>{" "}
                  button and copy the link (starts with{" "}
                  <code className="text-blue-300 font-mono">webcal://</code> or{" "}
                  <code className="text-blue-300 font-mono">https://</code>).
                </li>
              </ol>
            </div>

            {/* Sync Input Form */}
            <form onSubmit={handleSyncCalendar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  LeagueApps Calendar URL (.ics / webcal)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    placeholder="webcal://nycfooty.leagueapps.com/leagues/soccer/schedule.ics..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Messages */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-800/80 bg-rose-950/40 p-3 flex items-start gap-2 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-3 flex items-start gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLoadSampleFeed}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Try Sample NYC Footy Feed</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Done
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-lg shadow-blue-950/50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    <span>{isLoading ? "Syncing..." : "Sync Schedule"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Roster Import */}
        {activeTab === "roster" && (
          <form onSubmit={handleImportRosterCsv} className="mt-6 space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
              <span className="font-bold text-white">NYC Footy LeagueApps Roster Format:</span>
              <p className="mt-1 text-zinc-400">
                LeagueApps exports rosters as <code className="text-blue-300 font-mono">&quot;First Name&quot;,&quot;Last Name&quot;</code>.
                Simply paste the raw CSV text below. Co-ed female players (Mariama, Eris, etc.) will be automatically recognized!
              </p>
            </div>

            {/* Mode selection: Replace vs Append */}
            <div className="flex items-center gap-4 text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <span className="font-semibold text-white">Import Action:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="text-blue-600"
                />
                <span>Replace Roster (Recommended)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === "append"}
                  onChange={() => setImportMode("append")}
                  className="text-blue-600"
                />
                <span>Append Players</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Paste LeagueApps CSV Rows
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRosterCsvText(
                      `"First Name","Last Name"\n"Mariama","Bah"\n"Brady","Miller"\n"Eris","Gao"\n"Ethan","Quigley"\n"Will","Quigley"\n"Rohit","Subramaniam"\n"Sahil","Doshi"\n"Chris","Tellez Luna"\n"Rahul","Fernandez"\n"Ahmed","Tariq"\n"Aravind","Elangovan"\n"Neil","Maru"`
                    )
                  }
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Paste My NYC Footy Roster
                </button>
              </div>
              <textarea
                rows={7}
                required
                value={rosterCsvText}
                onChange={(e) => setRosterCsvText(e.target.value)}
                placeholder={
                  '"First Name","Last Name"\n"Mariama","Bah"\n"Brady","Miller"\n"Eris","Gao"\n"Ethan","Quigley"'
                }
                className="w-full font-mono rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {rosterSuccess && (
              <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-3 flex items-start gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{rosterSuccess}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-950/50"
              >
                Import Roster
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
