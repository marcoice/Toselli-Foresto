import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevHub IT - Social Network per Professionisti IT",
  description: "Piattaforma social di nicchia per professionisti IT: opportunità di lavoro, formazione avanzata e certificazioni nel settore tecnologico.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}
      >
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 mx-auto max-w-lg min-h-screen bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm shadow-xl shadow-zinc-200/30 dark:shadow-none border-x border-zinc-100 dark:border-zinc-900">
          <main className="pb-24 pt-16">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
