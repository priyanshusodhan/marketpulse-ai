"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Mover {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function AIInsightCards() {
  const pathname = usePathname();
  const [insight, setInsight] = useState<{ text: string; glow: "emerald" | "red" | "cyan" | "gold" } | null>(null);
  const [allInsights, setAllInsights] = useState<{ text: string; glow: "emerald" | "red" | "cyan" | "gold" }[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const buildInsights = async () => {
      try {
        const [moversRes, indicesRes] = await Promise.all([fetch("/api/movers"), fetch("/api/indices")]);
        const movers = await moversRes.json();
        const indices = await indicesRes.json();
        if (!active) return;

        const insights: { text: string; glow: "emerald" | "red" | "cyan" | "gold" }[] = [];
        const gainers: Mover[] = Array.isArray(movers?.gainers) ? movers.gainers : [];
        const losers: Mover[] = Array.isArray(movers?.losers) ? movers.losers : [];
        const nifty = Array.isArray(indices)
          ? indices.find((x: { symbol?: string }) => x.symbol === "NIFTY 50") ?? indices[0]
          : null;

        if (nifty && Number.isFinite(Number(nifty.changePercent))) {
          const changePercent = Number(nifty.changePercent);
          insights.push({
            text: `NIFTY 50 is ${changePercent >= 0 ? "up" : "down"} ${Math.abs(changePercent).toFixed(2)}% in live session.`,
            glow: changePercent >= 0 ? "emerald" : "red",
          });
        }

        if (gainers[0]) {
          insights.push({
            text: `Top gainer right now: ${gainers[0].symbol} (${gainers[0].changePercent >= 0 ? "+" : ""}${gainers[0].changePercent.toFixed(2)}%).`,
            glow: "emerald",
          });
        }

        if (losers[0]) {
          insights.push({
            text: `Top loser right now: ${losers[0].symbol} (${losers[0].changePercent.toFixed(2)}%).`,
            glow: "red",
          });
        }

        if (gainers.length + losers.length > 0) {
          insights.push({
            text: `Market breadth pulse: ${gainers.length} gainers vs ${losers.length} losers in monitored basket.`,
            glow: "cyan",
          });
        }

        const fallback = {
          text: "Live AI briefing is online. Waiting for next market update batch.",
          glow: "gold" as const,
        };
        const next = insights.length > 0 ? insights : [fallback];
        setAllInsights(next);
        setInsight(next[0]);
        setIndex(0);
      } catch {
        if (!active) return;
        const fallback = {
          text: "Live AI briefing is temporarily unavailable. Auto-retrying in background.",
          glow: "gold" as const,
        };
        setAllInsights([fallback]);
        setInsight(fallback);
        setIndex(0);
      }
    };

    buildInsights();
    const refreshId = setInterval(buildInsights, 60_000);
    return () => {
      active = false;
      clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (allInsights.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % allInsights.length;
        setInsight(allInsights[next]);
        return next;
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [allInsights]);

  if (pathname === "/login" || pathname === "/signup") return null;
  if (!insight) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block max-w-sm pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`relative overflow-hidden rounded-xl p-4 bg-[#1a1500]/90 backdrop-blur-xl border pointer-events-auto shadow-2xl ${
            insight.glow === "emerald" 
              ? "border-[#39d98a]/30 shadow-[0_0_30px_rgba(57,217,138,0.15)]" 
              : insight.glow === "red" 
                ? "border-[#ff6b6b]/30 shadow-[0_0_30px_rgba(255,107,107,0.15)]" 
                : "border-[#f5c518]/30 shadow-[0_0_30px_rgba(245,197,24,0.15)]"
          }`}
        >
          {/* Animated decorative line */}
          <motion.div 
            className={`absolute top-0 left-0 bottom-0 w-1 ${
              insight.glow === "emerald" ? "bg-[#39d98a]" : insight.glow === "red" ? "bg-[#ff6b6b]" : "bg-[#f5c518]"
            }`}
            layoutId="insight-marker"
          />
          
          <div className="flex items-start gap-3 pl-2">
            <div className={`mt-0.5 w-6 h-6 flex items-center justify-center rounded-full bg-white/5`}>
              {insight.glow === "cyan" || insight.glow === "gold" ? (
                <svg className="w-4 h-4 text-[#f5c518]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ) : insight.glow === "emerald" ? (
                <svg className="w-4 h-4 text-[#39d98a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#ff6b6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#8a7a55] mb-1">AI Protocol Active</p>
              <p className="text-sm text-[#f0e6c8] leading-snug">{insight.text}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
