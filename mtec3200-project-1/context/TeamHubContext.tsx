"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Match,
  Player,
  RSVPStatus,
  SubCandidate,
  TacticalLineup,
  TeamSettings,
  UserProfile,
  UserRole,
  ShortageAlert,
} from "@/types/footy";
import {
  initialMatches,
  initialPlayers,
  initialSubCandidates,
  initialTeamSettings,
  initialUserProfiles,
} from "@/lib/initialData";
import { convertLeagueAppsEventsToMatches, ParsedLeagueAppsEvent } from "@/lib/leagueapps";

const STORAGE_KEY_SETTINGS = "nyc_footy_settings";
const STORAGE_KEY_PLAYERS = "nyc_footy_players";
const STORAGE_KEY_MATCHES = "nyc_footy_matches";
const STORAGE_KEY_SUBS = "nyc_footy_subs";
const STORAGE_KEY_TACTICS = "nyc_footy_tactics";
const STORAGE_KEY_USER = "nyc_footy_current_user";
const STORAGE_KEY_ROLE = "nyc_footy_active_role";

const getStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
};

interface TeamHubContextType {
  teamSettings: TeamSettings;
  updateTeamSettings: (updates: Partial<TeamSettings>) => void;
  players: Player[];
  addPlayer: (player: Omit<Player, "id">) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  replaceRoster: (newPlayers: Omit<Player, "id">[]) => void;
  matches: Match[];
  activeMatchId: string;
  setActiveMatchId: (id: string) => void;
  activeMatch: Match | undefined;
  updateRSVP: (matchId: string, playerId: string, status: RSVPStatus, reason?: string) => void;
  addMatch: (match: Omit<Match, "id">) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  subs: SubCandidate[];
  addSub: (sub: Omit<SubCandidate, "id">) => void;
  updateSub: (id: string, updates: Partial<SubCandidate>) => void;
  deleteSub: (id: string) => void;
  generateSubMessage: (sub: SubCandidate, match: Match) => string;
  triggerSubOutreach: (subId: string, matchId: string, channel: "whatsapp" | "sms") => string;
  confirmSubForMatch: (subId: string, matchId: string) => void;
  removeSubFromMatch: (subId: string, matchId: string) => void;
  tacticalLineups: Record<string, TacticalLineup>;
  updateTacticalSlot: (matchId: string, slotId: string, playerIdOrSubId: string) => void;
  setFormation: (matchId: string, formation: "2-3-1" | "3-2-1" | "2-2-2") => void;
  syncLeagueAppsMatches: (events: ParsedLeagueAppsEvent[], detectedTeamName?: string) => void;
  resetAllData: () => void;
  // User & Role
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  userProfiles: UserProfile[];
  switchPersona: (userId: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  toggleSubAvailability: (isAvailable: boolean, boroughs?: string[]) => void;
  // Alerts & Simulation
  activeAlerts: ShortageAlert[];
  dismissAlert: (alertId: string) => void;
  simulatePollScenario: (scenario: "female_drop" | "full_squad" | "mass_drop") => void;
  // Computed match metrics
  matchMetrics: {
    totalConfirmed: number;
    femaleConfirmed: number;
    targetSquadSize: number;
    minFemale: number;
    playerShortage: number;
    femaleShortage: number;
    isReady: boolean;
    statusLabel: string;
  };
  seasonRecord: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
  };
}

const TeamHubContext = createContext<TeamHubContextType | undefined>(undefined);

export function TeamHubProvider({ children }: { children: React.ReactNode }) {
  const [teamSettings, setTeamSettings] = useState<TeamSettings>(() =>
    getStored(STORAGE_KEY_SETTINGS, initialTeamSettings)
  );
  const [players, setPlayers] = useState<Player[]>(() =>
    getStored(STORAGE_KEY_PLAYERS, initialPlayers)
  );
  const [matches, setMatches] = useState<Match[]>(() =>
    getStored(STORAGE_KEY_MATCHES, initialMatches)
  );
  const [subs, setSubs] = useState<SubCandidate[]>(() =>
    getStored(STORAGE_KEY_SUBS, initialSubCandidates)
  );
  const [activeMatchId, setActiveMatchId] = useState<string>("match-4");
  const [tacticalLineups, setTacticalLineups] = useState<Record<string, TacticalLineup>>(() =>
    getStored(STORAGE_KEY_TACTICS, {
      "match-4": {
        formation: "2-3-1",
        positions: {
          GK: "p7",
          DEF_L: "p1",
          DEF_R: "p3",
          MID_L: "p2",
          MID_C: "p4",
          MID_R: "p9",
          FWD: "p5",
        },
      },
    })
  );
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() =>
    getStored("nyc_footy_user_profiles", initialUserProfiles)
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    getStored(STORAGE_KEY_USER, initialUserProfiles[0])
  );
  const [activeRole, setActiveRole] = useState<UserRole>(() =>
    getStored(STORAGE_KEY_ROLE, "captain")
  );
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem("nyc_footy_user_profiles", JSON.stringify(userProfiles));
    } catch (e) {
      console.warn(e);
    }
  }, [userProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, JSON.stringify(activeRole));
    } catch (e) {
      console.warn(e);
    }
  }, [activeRole]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(teamSettings));
    } catch (e) {
      console.warn(e);
    }
  }, [teamSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.warn(e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.warn(e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(subs));
    } catch (e) {
      console.warn(e);
    }
  }, [subs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TACTICS, JSON.stringify(tacticalLineups));
    } catch (e) {
      console.warn(e);
    }
  }, [tacticalLineups]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === activeMatchId) || matches[0];
  }, [matches, activeMatchId]);

  // Compute metrics for active match
  const matchMetrics = useMemo(() => {
    if (!activeMatch) {
      return {
        totalConfirmed: 0,
        femaleConfirmed: 0,
        targetSquadSize: teamSettings.targetSquadSize,
        minFemale: teamSettings.minFemalePlayers,
        playerShortage: teamSettings.targetSquadSize,
        femaleShortage: teamSettings.minFemalePlayers,
        isReady: false,
        statusLabel: "No Match Scheduled",
      };
    }

    // Confirmed roster players
    const confirmedPlayers = players.filter((p) => activeMatch.rsvps[p.id]?.status === "yes");
    // Confirmed subs
    const confirmedSubs = subs.filter((s) => activeMatch.subsConfirmed.includes(s.id));

    const totalConfirmed = confirmedPlayers.length + confirmedSubs.length;

    const femalePlayers = confirmedPlayers.filter((p) => p.gender === "female").length;
    const femaleSubs = confirmedSubs.filter((s) => s.gender === "female").length;
    const femaleConfirmed = femalePlayers + femaleSubs;

    const targetSquadSize = activeMatch.requiredPlayers || teamSettings.targetSquadSize;
    const minFemale = activeMatch.requiredFemalePlayers || teamSettings.minFemalePlayers;

    const playerShortage = Math.max(0, targetSquadSize - totalConfirmed);
    const femaleShortage = Math.max(0, minFemale - femaleConfirmed);

    const isReady = playerShortage === 0 && femaleShortage === 0;

    let statusLabel = "Game Ready";
    if (playerShortage > 0 && femaleShortage > 0) {
      statusLabel = `Short ${playerShortage} player${playerShortage > 1 ? "s" : ""} (${femaleShortage} woman needed)`;
    } else if (playerShortage > 0) {
      statusLabel = `Short ${playerShortage} player${playerShortage > 1 ? "s" : ""}`;
    } else if (femaleShortage > 0) {
      statusLabel = `Need ${femaleShortage} more woman player for co-ed rule`;
    }

    return {
      totalConfirmed,
      femaleConfirmed,
      targetSquadSize,
      minFemale,
      playerShortage,
      femaleShortage,
      isReady,
      statusLabel,
    };
  }, [activeMatch, players, subs, teamSettings]);

  // Season record
  const seasonRecord = useMemo(() => {
    let played = 0;
    let won = 0;
    let drawn = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    matches.forEach((m) => {
      if (m.score) {
        played++;
        goalsFor += m.score.us;
        goalsAgainst += m.score.opponent;
        if (m.score.us > m.score.opponent) won++;
        else if (m.score.us === m.score.opponent) drawn++;
        else lost++;
      }
    });

    const points = won * 3 + drawn * 1;
    return { played, won, drawn, lost, points, goalsFor, goalsAgainst };
  }, [matches]);

  const updateTeamSettings = (updates: Partial<TeamSettings>) => {
    setTeamSettings((prev) => ({ ...prev, ...updates }));
  };

  const addPlayer = (newPlayerData: Omit<Player, "id">) => {
    const newPlayer: Player = {
      ...newPlayerData,
      id: `p-${Date.now()}`,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const replaceRoster = (newPlayers: Omit<Player, "id">[]) => {
    const formatted: Player[] = newPlayers.map((p, idx) => ({
      ...p,
      id: `p-${idx + 1}-${Date.now()}`,
    }));
    setPlayers(formatted);
  };

  const updateRSVP = (matchId: string, playerId: string, status: RSVPStatus, reason?: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          rsvps: {
            ...m.rsvps,
            [playerId]: {
              status,
              reason: reason !== undefined ? reason : m.rsvps[playerId]?.reason,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      })
    );
  };

  const addMatch = (matchData: Omit<Match, "id">) => {
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}`,
    };
    setMatches((prev) => [newMatch, ...prev]);
    setActiveMatchId(newMatch.id);
  };

  const updateMatch = (id: string, updates: Partial<Match>) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const addSub = (subData: Omit<SubCandidate, "id">) => {
    const newSub: SubCandidate = {
      ...subData,
      id: `sub-${Date.now()}`,
    };
    setSubs((prev) => [...prev, newSub]);
  };

  const updateSub = (id: string, updates: Partial<SubCandidate>) => {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSub = (id: string) => {
    setSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const generateSubMessage = (sub: SubCandidate, match: Match) => {
    const dateFormatted = new Date(match.date + "T" + match.time).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    return `Hey ${sub.name.split(" ")[0]}! Our NYC Footy team (${teamSettings.name}) has a game this ${dateFormatted} at ${match.time} (${match.location} - ${match.fieldNumber}). We're short a player and would love to have you sub! Kit is ${match.kitColor}. Are you free to play?`;
  };

  const triggerSubOutreach = (subId: string, matchId: string, channel: "whatsapp" | "sms") => {
    const sub = subs.find((s) => s.id === subId);
    const match = matches.find((m) => m.id === matchId) || activeMatch;
    if (!sub || !match) return "";

    // Mark sub as contacted
    updateSub(subId, { statusForNextMatch: "contacted" });

    const message = generateSubMessage(sub, match);
    const cleanPhone = sub.phone.replace(/[^0-9]/g, "");

    let url = "";
    if (channel === "whatsapp") {
      const phoneParam = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
      url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
    } else {
      url = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    }

    return url;
  };

  const confirmSubForMatch = (subId: string, matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const exists = m.subsConfirmed.includes(subId);
        return {
          ...m,
          subsConfirmed: exists ? m.subsConfirmed : [...m.subsConfirmed, subId],
        };
      })
    );
    updateSub(subId, { statusForNextMatch: "confirmed" });
  };

  const removeSubFromMatch = (subId: string, matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          subsConfirmed: m.subsConfirmed.filter((id) => id !== subId),
        };
      })
    );
    updateSub(subId, { statusForNextMatch: "uncontacted" });
  };

  const updateTacticalSlot = (matchId: string, slotId: string, playerIdOrSubId: string) => {
    setTacticalLineups((prev) => {
      const current = prev[matchId] || { formation: "2-3-1", positions: {} };
      return {
        ...prev,
        [matchId]: {
          ...current,
          positions: {
            ...current.positions,
            [slotId]: playerIdOrSubId,
          },
        },
      };
    });
  };

  const setFormation = (matchId: string, formation: "2-3-1" | "3-2-1" | "2-2-2") => {
    setTacticalLineups((prev) => {
      const current = prev[matchId] || { formation: "2-3-1", positions: {} };
      return {
        ...prev,
        [matchId]: {
          ...current,
          formation,
        },
      };
    });
  };

  const resetAllData = () => {
    setTeamSettings(initialTeamSettings);
    setPlayers(initialPlayers);
    setMatches(initialMatches);
    setSubs(initialSubCandidates);
    setActiveMatchId("match-4");
    setTacticalLineups({
      "match-4": {
        formation: "2-3-1",
        positions: {
          GK: "p7",
          DEF_L: "p1",
          DEF_R: "p3",
          MID_L: "p2",
          MID_C: "p4",
          MID_R: "p9",
          FWD: "p5",
        },
      },
    });
    try {
      localStorage.clear();
    } catch (e) {
      console.warn(e);
    }
  };

  const syncLeagueAppsMatches = (
    events: ParsedLeagueAppsEvent[],
    detectedTeamName?: string
  ) => {
    if (detectedTeamName && detectedTeamName.trim()) {
      setTeamSettings((prev) => ({ ...prev, name: detectedTeamName.trim() }));
    }
    const converted = convertLeagueAppsEventsToMatches(
      events,
      matches,
      teamSettings.targetSquadSize,
      teamSettings.minFemalePlayers
    );
    setMatches(converted);
    if (converted.length > 0) {
      setActiveMatchId(converted[0].id);
    }
  };

  const switchPersona = (userId: string) => {
    const profile = userProfiles.find((u) => u.id === userId);
    if (profile) {
      setCurrentUser(profile);
      setActiveRole(profile.role);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      setUserProfiles((list) =>
        list.map((u) => (u.id === prev.id ? updated : u))
      );
      return updated;
    });
  };

  const toggleSubAvailability = (isAvailable: boolean, boroughs?: string[]) => {
    updateUserProfile({
      subAvailability: {
        ...currentUser.subAvailability,
        isAvailable,
        boroughs: boroughs || currentUser.subAvailability.boroughs,
      },
    });
    setSubs((prev) =>
      prev.map((s) =>
        s.name.toLowerCase() === currentUser.name.toLowerCase()
          ? { ...s, isAvailableForSubbing: isAvailable }
          : s
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlertIds((prev) => [...prev, alertId]);
  };

  const activeAlerts = useMemo<ShortageAlert[]>(() => {
    if (!activeMatch) return [];
    const alerts: ShortageAlert[] = [];

    if (matchMetrics.femaleShortage > 0) {
      const id = `alert-female-${activeMatch.id}`;
      if (!dismissedAlertIds.includes(id)) {
        alerts.push({
          id,
          matchId: activeMatch.id,
          type: "female_shortage",
          severity: "critical",
          message: `Co-ed Rule Alert: Only ${matchMetrics.femaleConfirmed} of ${matchMetrics.minFemale} female players confirmed for Week ${activeMatch.week}! Need ${matchMetrics.femaleShortage} more to prevent forfeit.`,
          femaleShortage: matchMetrics.femaleShortage,
          totalShortage: matchMetrics.playerShortage,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (matchMetrics.playerShortage > 0 && matchMetrics.femaleShortage === 0) {
      const id = `alert-player-${activeMatch.id}`;
      if (!dismissedAlertIds.includes(id)) {
        alerts.push({
          id,
          matchId: activeMatch.id,
          type: "player_shortage",
          severity: "warning",
          message: `Squad Shortage: ${matchMetrics.totalConfirmed}/${matchMetrics.targetSquadSize} confirmed for Week ${activeMatch.week}. Need ${matchMetrics.playerShortage} sub(s) for a healthy rotation.`,
          femaleShortage: 0,
          totalShortage: matchMetrics.playerShortage,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return alerts;
  }, [activeMatch, matchMetrics, dismissedAlertIds]);

  const simulatePollScenario = (scenario: "female_drop" | "full_squad" | "mass_drop") => {
    if (!activeMatch) return;
    setDismissedAlertIds([]);
    if (scenario === "female_drop") {
      updateRSVP(activeMatch.id, "p2", "no", "Sprained ankle in Thursday scrimmage");
    } else if (scenario === "full_squad") {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id !== activeMatch.id) return m;
          const newRsvps = { ...m.rsvps };
          players.forEach((p) => {
            newRsvps[p.id] = { status: "yes", updatedAt: new Date().toISOString() };
          });
          return { ...m, rsvps: newRsvps };
        })
      );
    } else if (scenario === "mass_drop") {
      updateRSVP(activeMatch.id, "p2", "no", "Out of town");
      updateRSVP(activeMatch.id, "p3", "no", "Attending wedding");
      updateRSVP(activeMatch.id, "p5", "maybe", "Flight delay");
    }
  };

  return (
    <TeamHubContext.Provider
      value={{
        teamSettings,
        updateTeamSettings,
        players,
        addPlayer,
        updatePlayer,
        deletePlayer,
        replaceRoster,
        matches,
        activeMatchId,
        setActiveMatchId,
        activeMatch,
        updateRSVP,
        addMatch,
        updateMatch,
        subs,
        addSub,
        updateSub,
        deleteSub,
        generateSubMessage,
        triggerSubOutreach,
        confirmSubForMatch,
        removeSubFromMatch,
        tacticalLineups,
        updateTacticalSlot,
        setFormation,
        syncLeagueAppsMatches,
        resetAllData,
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        userProfiles,
        switchPersona,
        updateUserProfile,
        toggleSubAvailability,
        activeAlerts,
        dismissAlert,
        simulatePollScenario,
        matchMetrics,
        seasonRecord,
      }}
    >
      {children}
    </TeamHubContext.Provider>
  );
}

export function useTeamHub() {
  const context = useContext(TeamHubContext);
  if (!context) {
    throw new Error("useTeamHub must be used within a TeamHubProvider");
  }
  return context;
}
