"use client";

import dynamic from "next/dynamic";

const TeamDashboard = dynamic(() => import("@/components/TeamDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-950/50 text-2xl animate-pulse">
        ⚽
      </div>
      <div className="mt-4 text-base font-bold text-white tracking-tight">
        NYC Footy Team Hub
      </div>
      <div className="mt-1 text-xs text-zinc-500">
        Loading squad command center...
      </div>
    </div>
  ),
});

export default function Home() {
  return <TeamDashboard />;
}
