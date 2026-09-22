import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { footyClerkTheme } from "@/lib/clerkTheme";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pitch-grid-bg flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Club Branding & Navigation */}
      <div className="w-full max-w-md mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-4 px-3 py-1.5 rounded-xl bg-[#111823] border border-zinc-800 hover:border-emerald-500/40"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#00e676]" />
          <span>Back to Match Hub</span>
        </Link>

        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00e676] border border-emerald-500/30 text-sm">
            ⚽
          </div>
          <h1 className="text-lg font-black text-white tracking-tight">
            Bushwick Borough FC
          </h1>
        </div>
        <p className="text-xs text-zinc-400">
          Create an account to join the roster or list in the sub directory
        </p>
      </div>

      {/* Styled Clerk SignUp Card */}
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={footyClerkTheme}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>

      {/* Subtext */}
      <div className="mt-6 text-center text-[11px] text-zinc-500">
        NYC Footy South Williamsburg P3 Division • Bushwick Inlet Park
      </div>
    </div>
  );
}
