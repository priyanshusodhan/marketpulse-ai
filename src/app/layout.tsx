import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import AmbientSoundToggle from "@/components/AmbientSoundToggle";
import CommandPalette from "@/components/CommandPalette";
import AIInsightCards from "@/components/AIInsightCards";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketPulse AI | Luxury Financial Intelligence",
  description: "AI-powered stock market intelligence dashboard with live data, predictions, and portfolio tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#030308] text-white`}>
        <ScrollProgress />
        <Navbar />
        <CommandPalette />
        <AmbientSoundToggle />
        <AIInsightCards />
        <main className="relative z-10 pt-20">{children}</main>
      </body>
    </html>
  );
}
