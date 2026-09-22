import { NextRequest, NextResponse } from "next/server";
import { parseLeagueAppsIcs } from "@/lib/leagueapps";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let feedUrl: string = body.feedUrl?.trim();
    const teamName: string = body.teamName?.trim() || "";

    if (!feedUrl) {
      return NextResponse.json(
        { error: "Please provide a LeagueApps calendar subscription feed URL." },
        { status: 400 }
      );
    }

    // Convert webcal:// to https://
    if (feedUrl.startsWith("webcal://")) {
      feedUrl = feedUrl.replace("webcal://", "https://");
    }

    // Validate protocol
    if (!feedUrl.startsWith("http://") && !feedUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Feed URL must start with https:// or webcal://" },
        { status: 400 }
      );
    }

    // Fetch the calendar feed
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "NYC-Footy-Team-Hub/1.0",
        Accept: "text/calendar, text/plain, */*",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch LeagueApps calendar feed (HTTP status ${response.status}). Make sure the subscription link is public and active.`,
        },
        { status: 400 }
      );
    }

    const icsText = await response.text();

    if (!icsText.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        {
          error: "The provided URL did not return a valid iCalendar (.ics) format. Please ensure you clicked 'Subscribe to Calendar' on LeagueApps.",
        },
        { status: 400 }
      );
    }

    const parseResult = parseLeagueAppsIcs(icsText, teamName);

    return NextResponse.json({
      success: true,
      count: parseResult.events.length,
      detectedTeamName: parseResult.detectedTeamName,
      events: parseResult.events,
    });
  } catch (error) {
    console.error("LeagueApps sync error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching LeagueApps calendar." },
      { status: 500 }
    );
  }
}
