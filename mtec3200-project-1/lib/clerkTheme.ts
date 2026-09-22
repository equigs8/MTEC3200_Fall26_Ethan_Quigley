import { dark } from "@clerk/themes";

/**
 * Shared Clerk appearance configuration matching NYC Footy / Bushwick Borough FC theme:
 * Deep pitch canvas (#090d12), card surfaces (#111823), neon footy green (#00e676),
 * and modern rounded curves.
 */
export const footyClerkTheme = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#00e676",
    colorText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorBackground: "#111823",
    colorInputBackground: "#090d12",
    colorInputText: "#ffffff",
    colorDanger: "#ef4444",
    colorSuccess: "#00e676",
    borderRadius: "1rem",
    fontFamily: "var(--font-poppins), sans-serif",
  },
  elements: {
    card: "bg-[#111823] border border-zinc-800/90 shadow-2xl rounded-3xl backdrop-blur-xl",
    headerTitle: "text-white font-black text-xl tracking-tight",
    headerSubtitle: "text-zinc-400 text-xs",
    formButtonPrimary:
      "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-95 border border-emerald-400/30",
    socialButtonsBlockButton:
      "bg-[#090d12] border border-zinc-700 text-zinc-200 hover:bg-zinc-800/80 hover:text-white rounded-xl font-semibold text-xs transition active:scale-95",
    socialButtonsBlockButtonText: "font-semibold text-xs text-zinc-200",
    formFieldLabel: "text-zinc-300 font-semibold text-xs tracking-wide",
    formFieldInput:
      "bg-[#090d12] border border-zinc-700 text-white rounded-xl focus:border-[#00e676] focus:ring-1 focus:ring-[#00e676] text-xs py-2.5 transition",
    footerActionLink: "text-[#00e676] hover:text-emerald-300 font-semibold text-xs transition",
    footerActionText: "text-zinc-400 text-xs",
    identityPreview: "bg-[#090d12] border border-zinc-800 rounded-xl",
    userButtonAvatarBox: "h-8 w-8 rounded-xl border border-emerald-500/40 shadow-sm",
    userButtonPopoverCard:
      "bg-[#111823] border border-zinc-800/90 shadow-2xl rounded-2xl text-white backdrop-blur-xl",
    userButtonPopoverActionButton:
      "hover:bg-zinc-800/80 text-zinc-300 hover:text-white rounded-xl transition",
    userButtonPopoverActionButtonText: "text-xs font-semibold text-zinc-200",
    userPreviewMainIdentifier: "text-white font-bold text-sm",
    userPreviewSecondaryIdentifier: "text-zinc-400 text-xs",
    dividerLine: "bg-zinc-800",
    dividerText: "text-zinc-500 text-xs",
    footer: "border-t border-zinc-800/80 bg-[#090d12]/50",
  },
};
