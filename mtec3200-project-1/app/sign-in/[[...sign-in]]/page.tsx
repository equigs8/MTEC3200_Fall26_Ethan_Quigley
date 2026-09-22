import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#090d12] flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to NYC Footy Hub
        </Link>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignIn
          appearance={{
            elements: {
              card: "bg-[#111823] border border-zinc-800 shadow-2xl text-white",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-zinc-400",
              formFieldLabel: "text-zinc-300",
              formButtonPrimary:
                "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
            },
          }}
        />
      </div>
    </div>
  );
}
