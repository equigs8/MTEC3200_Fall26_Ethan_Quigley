export type GenderCategory = "female" | "male" | "non-binary";

export type RSVPStatus = "yes" | "no" | "maybe" | "pending";

export type Position = "GK" | "DEF" | "MID" | "FWD";

export type UserRole = "captain" | "player" | "free_agent";

// NYC Footy Divisions: P1 Novice, P2 Casual/Rec, P3 Intermediate, P4 Competitive, P5 Premier
export type SkillLevel = "P1" | "P2" | "P3" | "P4" | "P5";

export interface UserProfile {
  id: string;
  clerkId?: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatar?: string;
  gender: GenderCategory;
  skillLevel: SkillLevel;
  preferredPositions: Position[];
  teamId?: string;
  isCaptain?: boolean;
  subAvailability: {
    isAvailable: boolean;
    boroughs: string[];
    availableMatchIds?: string[];
    notes?: string;
  };
  bio?: string;
}

export interface Player {
  id: string;
  name: string;
  number?: number;
  gender: GenderCategory;
  preferredPositions: Position[];
  isCaptain?: boolean;
  phone?: string;
  avatar?: string;
  skillLevel?: SkillLevel;
  subAvailability?: {
    isAvailable: boolean;
    boroughs?: string[];
    notes?: string;
  };
}

export interface MatchRSVP {
  status: RSVPStatus;
  reason?: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  week: number;
  opponent: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "16:00"
  location: string;
  fieldNumber: string;
  googleMapsUrl: string;
  subwayInfo?: string;
  kitColor: "Light" | "Dark";
  pollDeadline: string; // ISO string e.g. "2026-09-25T17:00:00"
  requiredPlayers: number; // e.g. 7 or 8
  requiredFemalePlayers: number; // NYC Footy co-ed rule, usually 2
  rsvps: Record<string, MatchRSVP>; // playerId -> RSVP
  subsConfirmed: string[]; // sub IDs who accepted
  score?: {
    us: number;
    opponent: number;
  };
  notes?: string;
}

export interface SubCandidate {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender: GenderCategory;
  positions: Position[];
  tier: 1 | 2 | 3; // 1: Go-to starter sub, 2: Reliable friend, 3: Emergency contact
  reliabilityScore: number; // 1 to 5 stars
  skillLevel?: SkillLevel;
  boroughs?: string[];
  statusForNextMatch: "uncontacted" | "contacted" | "confirmed" | "declined";
  notes?: string;
  bio?: string;
  lastPlayedDate?: string;
  isAvailableForSubbing?: boolean;
}

export interface FreeAgentProfile extends SubCandidate {
  registeredAt?: string;
}

export interface ShortageAlert {
  id: string;
  matchId: string;
  type: "female_shortage" | "player_shortage" | "deadline_urgency";
  severity: "critical" | "warning";
  message: string;
  femaleShortage: number;
  totalShortage: number;
  resolved: boolean;
  createdAt: string;
}

export interface TeamSettings {
  name: string;
  leagueName: string;
  division: string;
  format: "7v7" | "8v8" | "11v11";
  targetSquadSize: number; // default 7 on field + bench (e.g. 8-9)
  minFemalePlayers: number; // default 2
  homeKitColor: string; // e.g. "White"
  awayKitColor: string; // e.g. "Navy Blue"
  captainName: string;
  captainPhone: string;
}

export interface TacticalLineup {
  formation: "2-3-1" | "3-2-1" | "2-2-2";
  positions: Record<string, string>; // slotId -> playerId or subId
}

