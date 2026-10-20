import { dark } from "@clerk/themes";

/**
 * @file clerkTheme.ts
 * @description Shared Clerk appearance configuration for the NYC Footy / Bushwick Borough FC
 * authentication flows (<SignIn />, <SignUp />, <UserButton />, and modals).
 *
 * Design & Compatibility Notes:
 * 1. Tailwind CSS v4 Cascade Layering:
 *    Specifies `cssLayerName: "clerk"` so Clerk's runtime stylesheet is placed inside
 *    `@layer clerk` (declared before `utilities` in `app/globals.css`), allowing
 *    Tailwind utility classes to cleanly override base Clerk styles.
 * 2. Clerk v7+ & Legacy Variable Support:
 *    Provides both modern Clerk v7 color tokens (`colorForeground`, `colorMutedForeground`,
 *    `colorNeutral`, `colorInput`, `colorInputForeground`, `colorPrimaryForeground`) and
 *    legacy tokens (`colorText`, `colorTextSecondary`, `colorInputBackground`, `colorInputText`)
 *    to ensure high-contrast white/slate text on deep navy surfaces (#162032 / #1e293b).
 */
export const footyClerkTheme = {
  baseTheme: dark,
  cssLayerName: "clerk",
  variables: {
    // Brand primary accent (Neon Footy Green) & dark text on primary buttons
    colorPrimary: "#00e676",
    colorPrimaryForeground: "#052e16",
    colorTextOnPrimaryBackground: "#052e16",

    // Primary & secondary text colors for high contrast on dark cards
    colorForeground: "#ffffff",
    colorText: "#ffffff",
    colorMutedForeground: "#cbd5e1",
    colorTextSecondary: "#cbd5e1",

    // Card, muted container, and input field surfaces
    colorBackground: "#162032",
    colorMuted: "#1e293b",
    colorInput: "#1e293b",
    colorInputBackground: "#1e293b",
    colorInputForeground: "#ffffff",
    colorInputText: "#ffffff",

    // Neutral base color used by Clerk to generate borders, dividers, and hover states
    colorNeutral: "#ffffff",
    colorAlphaShade: "#ffffff",
    colorBorder: "#334155",
    colorRing: "#00e676",

    // Semantic feedback colors
    colorDanger: "#f87171",
    colorSuccess: "#00e676",
    colorWarning: "#fbbf24",

    // Geometry & typography
    borderRadius: "0.875rem",
    fontFamily: "var(--font-poppins), sans-serif",
  },
  elements: {
    // Card container & outer shell
    rootBox: "w-full",
    cardBox:
      "bg-[#162032] border border-slate-700/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_30px_-5px_rgba(0,230,118,0.12)] rounded-3xl overflow-hidden text-white",
    card: "bg-[#162032] text-white shadow-none rounded-3xl",

    // Card header titles & subtitles
    headerTitle: "!text-white font-black text-xl tracking-tight",
    headerSubtitle: "!text-slate-200 text-xs font-medium",

    // Primary submit button & OAuth social login buttons
    formButtonPrimary:
      "!bg-[#00e676] hover:!bg-emerald-400 !text-zinc-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95 border border-emerald-300/40",
    socialButtonsBlockButton:
      "!bg-[#1e293b] border !border-slate-600 !text-white hover:!bg-[#334155] hover:!border-slate-500 rounded-xl font-semibold text-xs py-2.5 transition active:scale-95 shadow-sm",
    socialButtonsBlockButtonText: "font-semibold text-xs !text-white",
    socialButtonsProviderIcon__apple: "invert brightness-200",
    socialButtonsProviderIcon__github: "invert brightness-200",

    // Form labels, inputs, and field actions
    formFieldLabel: "!text-slate-100 font-semibold text-xs tracking-wide",
    formFieldHintText: "!text-slate-300 text-xs",
    formFieldInput:
      "!bg-[#1e293b] border !border-slate-600 !text-white placeholder:!text-slate-400 rounded-xl focus:!border-[#00e676] focus:ring-2 focus:ring-[#00e676]/30 text-xs py-2.5 transition shadow-inner",
    formFieldInputShowPasswordButton: "!text-slate-300 hover:!text-white",
    formFieldAction: "!text-[#00e676] hover:!text-emerald-300 font-semibold text-xs",

    // Footer links & identity preview badges
    footerActionLink:
      "!text-[#00e676] hover:!text-emerald-300 font-bold text-xs transition underline-offset-4 hover:underline",
    footerActionText: "!text-slate-200 text-xs font-medium",
    identityPreview: "!bg-[#1e293b] border !border-slate-600 rounded-xl !text-white",
    identityPreviewText: "!text-white text-xs font-medium",
    identityPreviewEditButton: "!text-[#00e676] hover:!text-emerald-300",

    // Authenticated UserButton avatar & popover menu
    userButtonAvatarBox: "h-8 w-8 rounded-xl border border-emerald-500/40 shadow-sm",
    userButtonPopoverCard:
      "!bg-[#162032] border !border-slate-700 shadow-2xl rounded-2xl !text-white backdrop-blur-xl",
    userButtonPopoverActionButton:
      "hover:!bg-slate-800 !text-slate-100 hover:!text-white rounded-xl transition",
    userButtonPopoverActionButtonText: "text-xs font-semibold !text-slate-100",
    userButtonPopoverActionButtonIcon: "!text-slate-300",
    userPreviewMainIdentifier: "!text-white font-bold text-sm",
    userPreviewSecondaryIdentifier: "!text-slate-300 text-xs",

    // Dividers, footers, OTP inputs, and alerts
    dividerLine: "!bg-slate-700",
    dividerText: "!text-slate-300 text-xs font-medium",
    footer: "border-t !border-slate-700/80 !bg-[#111827]",
    footerPages: "!bg-[#111827] !text-slate-300",
    otpCodeFieldInput:
      "!bg-[#1e293b] border !border-slate-600 !text-white rounded-xl focus:!border-[#00e676]",
    alertText: "!text-slate-100 text-xs",
  },
};


