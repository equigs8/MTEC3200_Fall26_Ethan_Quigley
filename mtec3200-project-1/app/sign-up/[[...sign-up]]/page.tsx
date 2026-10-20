import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { footyClerkTheme } from "@/lib/clerkTheme";

/**
 * SignUpPage Component
 *
 * Renders the dedicated `/sign-up` registration route for Bushwick Borough FC.
 * Allows new players and free agents to create an account and join the squad
 * or list themselves in the NYC Footy substitute pool using the shared
 * high-contrast `footyClerkTheme`.
 */
export default function SignUpPage() {
  return (
    <div className="relative min-h-screen pitch-grid-bg flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient Spotlight for Card Contrast & Readability */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-[110px]" />

      {/* Top Club Branding & Navigation Back to Dashboard */}
      <div className="relative z-10 w-full max-w-md mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-100 hover:text-white transition-colors mb-5 px-3.5 py-2 rounded-xl bg-[#162032] border border-slate-700 hover:border-emerald-400/60 hover:bg-[#1e293b] shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#00e676]" />
          <span>Back to Match Hub</span>
        </Link>

        <div className="flex items-center justify-center gap-2.5 mb-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00e676] border border-emerald-400/40 text-base shadow-sm">
            ⚽
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Bushwick Borough FC
          </h1>
        </div>
        <p className="text-xs font-medium text-slate-200">
          Create an account to join the roster or list in the sub directory
        </p>
      </div>

      {/* High-Contrast Clerk SignUp Component */}
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignUp
          appearance={footyClerkTheme}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>

      {/* League & Venue Footer Subtext */}
      <div className="relative z-10 mt-6 text-center text-xs font-medium text-slate-300">
        NYC Footy South Williamsburg P3 Division • Bushwick Inlet Park
      </div>
    </div>
  );
}


