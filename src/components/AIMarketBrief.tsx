"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

interface IndexPoint {
  symbol: string;
  value: number;
  changePercent: number;
}

interface MoverPoint {
  symbol: string;
  changePercent: number;
}

interface PredictionMetrics {
  upsideProb: number;
  downsideProb: number;
  stableProb: number;
  confidence: number;
  signal: "BUY" | "SELL" | "HOLD";
  expectedChangePct: number;
}

interface PredictionResponse {
  horizon?: string;
  metrics?: PredictionMetrics;
}

interface BriefData {
  stance: "Bullish" | "Bearish" | "Range-Bound";
  risk: "Low" | "Medium" | "High";
  confidence: number;
  bullets: string[];
  action: string;
  updatedAt: string;
}

function signedPercent(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

function riskClass(risk: BriefData["risk"]): string {
  if (risk === "Low") return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
  if (risk === "High") return "text-rose-300 border-rose-500/40 bg-rose-500/10";
  return "text-amber-300 border-amber-500/40 bg-amber-500/10";
}

export default function AIMarketBrief({ className = "" }: { className?: string }) {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrief = useCallback(async () => {
    try {
      setError(null);
      const [indicesRes, moversRes, predictionRes] = await Promise.all([
        fetch("/api/indices", { cache: "no-store" }),
        fetch("/api/movers", { cache: "no-store" }),
        fetch("/api/prediction?symbol=NIFTY&horizon=1W", { cache: "no-store" }),
      ]);

      const indicesJson = await indicesRes.json();
      const moversJson = await moversRes.json();
      const predictionJson = await predictionRes.json();

      const indices: IndexPoint[] = Array.isArray(indicesJson) ? indicesJson : [];
      const nifty = indices.find((x) => x.symbol === "NIFTY 50") ?? indices[0];

      const gainers: MoverPoint[] = Array.isArray(moversJson?.gainers) ? moversJson.gainers : [];
      const losers: MoverPoint[] = Array.isArray(moversJson?.losers) ? moversJson.losers : [];
      const topGainer = gainers[0];
      const topLoser = losers[0];

      const prediction: PredictionResponse = predictionJson ?? {};
      const metrics = prediction.metrics;

      const upside = metrics?.upsideProb ?? 50;
      const downside = metrics?.downsideProb ?? 50;
      const signalBias = upside - downside;
      const stance: BriefData["stance"] =
        signalBias > 10 ? "Bullish" : signalBias < -10 ? "Bearish" : "Range-Bound";

      const indexSwing = Math.abs(Number(nifty?.changePercent ?? 0));
      const risk: BriefData["risk"] =
        downside > 40 || indexSwing > 1.3 ? "High" : downside > 25 || indexSwing > 0.8 ? "Medium" : "Low";

      const confidence = Math.max(30, Math.min(95, Math.round(metrics?.confidence ?? 60)));
      const horizon = prediction.horizon ?? "1 Week";

      const bullets = [
        nifty
          ? `${nifty.symbol} live move: ${signedPercent(Number(nifty.changePercent ?? 0))}`
          : "Index feed is syncing",
        topGainer
          ? `Leader: ${topGainer.symbol} (${signedPercent(Number(topGainer.changePercent ?? 0))})`
          : "Top gainer data not available right now",
        topLoser
          ? `Weakest: ${topLoser.symbol} (${signedPercent(Number(topLoser.changePercent ?? 0))})`
          : "Top loser data not available right now",
        `Model odds (${horizon}): Upside ${Math.round(upside)}% | Downside ${Math.round(downside)}% | Stable ${Math.round(
          metrics?.stableProb ?? 0,
        )}%`,
      ];

      const action =
        stance === "Bullish" && risk !== "High"
          ? "Action: Prefer momentum setups with tight stops."
          : stance === "Bearish"
            ? "Action: Stay defensive; favor risk-controlled entries."
            : "Action: Range conditions; focus on selective breakouts.";

      setBrief({
        stance,
        risk,
        confidence,
        bullets,
        action,
        updatedAt: new Date().toLocaleTimeString(),
      });
    } catch {
      setError("AI brief is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrief();
    const id = setInterval(loadBrief, 45_000);
    return () => clearInterval(id);
  }, [loadBrief]);

  const stanceColor = useMemo(() => {
    if (!brief) return "text-cyan-300";
    if (brief.stance === "Bullish") return "text-emerald-300";
    if (brief.stance === "Bearish") return "text-rose-300";
    return "text-amber-300";
  }, [brief]);

  return (
    <GlassCard className={className} hover={false} tilt={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">AI Market Brief</p>
          <h3 className="text-xl font-semibold text-white">Fast Daily Context</h3>
        </div>
        <div className="flex items-center gap-2">
          {brief && (
            <span className={`text-xs px-2 py-1 rounded-md border ${riskClass(brief.risk)}`}>
              Risk {brief.risk}
            </span>
          )}
          <button
            onClick={loadBrief}
            className="text-xs px-3 py-1.5 rounded-md border border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && !brief ? (
        <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
      ) : error && !brief ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : brief ? (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <span className={`font-semibold ${stanceColor}`}>Stance: {brief.stance}</span>
            <span className="text-zinc-400">Confidence: {brief.confidence}%</span>
            <span className="text-zinc-500">Updated: {brief.updatedAt}</span>
          </div>

          <ul className="space-y-2 mb-4">
            {brief.bullets.map((line) => (
              <li key={line} className="text-sm text-zinc-300">
                {line}
              </li>
            ))}
          </ul>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-cyan-100/90 bg-cyan-500/10 border border-cyan-400/20 rounded-lg px-3 py-2"
          >
            {brief.action}
          </motion.p>
        </>
      ) : null}
    </GlassCard>
  );
}

