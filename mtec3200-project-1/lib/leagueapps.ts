import { Match } from "@/types/footy";

export interface ParsedLeagueAppsEvent {
  uid: string;
  summary: string;
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  fieldNumber: string;
  description: string;
  kitColor: "Light" | "Dark";
}

export interface LeagueAppsParseResult {
  events: ParsedLeagueAppsEvent[];
  detectedTeamName?: string;
  frequencyMap: Record<string, number>;
}

function cleanTeamName(raw: string): string {
  return raw
    .replace(/\s*\((?:home|away)\)\s*/gi, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

/**
 * Parses an iCalendar (.ics) string from LeagueApps into structured match fixtures,
 * and automatically detects the user's team name as the team that appears most frequently.
 */
export function parseLeagueAppsIcs(
  icsText: string,
  fallbackTeamName: string = ""
): LeagueAppsParseResult {
  const eventBlocks = icsText.split(/BEGIN:VEVENT/i);
  const frequencyMap: Record<string, number> = {};

  // PASS 1: Count team appearances across all game summaries
  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split(/END:VEVENT/i)[0];
    const unfolded = block.replace(/\r?\n[ \t]/g, "");
    const match = unfolded.match(/(?:^|\r?\n)SUMMARY(?:;[^:]*)?:(.*)/i);
    if (!match) continue;

    const summary = match[1]
      .trim()
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\n/g, " ");

    let candidates: string[] = [];
    if (summary.includes(" vs ") || summary.includes(" vs. ")) {
      candidates = summary.split(/\s+vs\.?\s+/i);
    } else if (summary.includes(" at ")) {
      candidates = summary.split(/\s+at\s+/i);
    }

    candidates.forEach((c) => {
      const clean = cleanTeamName(c);
      if (clean && clean.length > 1) {
        frequencyMap[clean] = (frequencyMap[clean] || 0) + 1;
      }
    });
  }

  // Find the team name that appears the most frequently
  let detectedTeamName: string | undefined = undefined;
  let highestCount = 0;

  for (const [name, count] of Object.entries(frequencyMap)) {
    if (count > highestCount) {
      highestCount = count;
      detectedTeamName = name;
    }
  }

  const effectiveTeamName = detectedTeamName || fallbackTeamName;

  // PASS 2: Parse individual match events using the detected team name
  const events: ParsedLeagueAppsEvent[] = [];

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split(/END:VEVENT/i)[0];

    const getField = (fieldName: string): string => {
      const unfolded = block.replace(/\r?\n[ \t]/g, "");
      const match = unfolded.match(
        new RegExp(`(?:^|\\r?\\n)${fieldName}(?:;[^:]*)?:(.*)`, "i")
      );
      return match ? match[1].trim() : "";
    };

    const uid = getField("UID") || `la-${i}`;
    let summary = getField("SUMMARY");
    const rawDtStart = getField("DTSTART");
    const locationRaw = getField("LOCATION");
    const description = getField("DESCRIPTION");

    if (!summary && !rawDtStart) continue;

    summary = summary
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\n/g, " ");

    let opponent = "Opponent";
    let isHome = true;

    if (summary.includes(" vs ") || summary.includes(" vs. ")) {
      const parts = summary.split(/\s+vs\.?\s+/i).map(cleanTeamName);
      if (parts.length === 2) {
        if (
          effectiveTeamName &&
          parts[0].toLowerCase().includes(effectiveTeamName.toLowerCase())
        ) {
          opponent = parts[1];
          isHome = true;
        } else if (
          effectiveTeamName &&
          parts[1].toLowerCase().includes(effectiveTeamName.toLowerCase())
        ) {
          opponent = parts[0];
          isHome = false;
        } else {
          opponent = parts[1];
        }
      }
    } else if (summary.includes(" at ")) {
      const parts = summary.split(/\s+at\s+/i).map(cleanTeamName);
      if (parts.length === 2) {
        if (
          effectiveTeamName &&
          parts[0].toLowerCase().includes(effectiveTeamName.toLowerCase())
        ) {
          opponent = parts[1];
          isHome = false; // "Team at Opponent" -> Away
        } else {
          opponent = parts[1];
          isHome = false;
        }
      }
    } else {
      opponent = summary;
    }

    // Parse DTSTART (e.g. 20260927T200000Z)
    let dateStr = "";
    let timeStr = "16:00";

    if (rawDtStart) {
      const cleanDt = rawDtStart.replace(/[^0-9TZ]/g, "");
      if (cleanDt.length >= 8) {
        const year = cleanDt.substring(0, 4);
        const month = cleanDt.substring(4, 6);
        const day = cleanDt.substring(6, 8);
        dateStr = `${year}-${month}-${day}`;

        if (cleanDt.includes("T") && cleanDt.length >= 13) {
          const hour = cleanDt.substring(9, 11);
          const minute = cleanDt.substring(11, 13);
          timeStr = `${hour}:${minute}`;
        }
      }
    }

    // Parse location & field
    let location = locationRaw.replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
    let fieldNumber = "Main Field";

    if (location.includes(" - ")) {
      const locParts = location.split(" - ");
      location = locParts[0].trim();
      fieldNumber = locParts[1].trim();
    } else if (location.includes(", Field")) {
      const locParts = location.split(", Field");
      location = locParts[0].trim();
      fieldNumber = `Field ${locParts[1].trim()}`;
    }

    if (!location) {
      location = "NYC Footy Pitch";
    }

    const kitColor: "Light" | "Dark" = isHome ? "Light" : "Dark";

    events.push({
      uid,
      summary,
      opponent,
      date: dateStr,
      time: timeStr,
      location,
      fieldNumber,
      description,
      kitColor,
    });
  }

  return {
    events,
    detectedTeamName,
    frequencyMap,
  };
}

/**
 * Converts parsed events into standard Match objects for the Team Hub.
 */
export function convertLeagueAppsEventsToMatches(
  events: ParsedLeagueAppsEvent[],
  existingMatches: Match[],
  targetSquadSize: number = 8,
  minFemalePlayers: number = 2
): Match[] {
  return events.map((event, index) => {
    const existing = existingMatches.find(
      (m) =>
        m.id === event.uid ||
        (m.date === event.date &&
          m.opponent.toLowerCase() === event.opponent.toLowerCase())
    );

    if (existing) {
      return {
        ...existing,
        time: event.time || existing.time,
        location: event.location || existing.location,
        fieldNumber: event.fieldNumber || existing.fieldNumber,
        kitColor: event.kitColor || existing.kitColor,
      };
    }

    const matchDateObj = new Date(`${event.date}T${event.time}:00`);
    const deadline = new Date(matchDateObj);
    deadline.setDate(deadline.getDate() - 2);
    deadline.setHours(17, 0, 0, 0);

    return {
      id: event.uid || `match-la-${index + 1}`,
      week: index + 1,
      opponent: event.opponent,
      date: event.date,
      time: event.time,
      location: event.location,
      fieldNumber: event.fieldNumber,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(
        event.location
      )}`,
      kitColor: event.kitColor,
      pollDeadline: deadline.toISOString(),
      requiredPlayers: targetSquadSize,
      requiredFemalePlayers: minFemalePlayers,
      rsvps: {},
      subsConfirmed: [],
      notes: event.description || "Synced from LeagueApps",
    };
  });
}
