import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#090d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NYC Footy Team Hub & Free Agent Portal",
  description:
    "Team command center for NYC Footy: weekly attendance polls, 7v7 tactical lineups, match schedule, and free agent sub recruitment.",
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#090d12] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 pb-16 md:pb-0"
      >
        <ClerkProvider publishableKey={publishableKey}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
