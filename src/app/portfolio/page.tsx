"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/charts/LineChart";
import Link from "next/link";

const LEADERBOARD = [
  { rank: 1, name: "TraderPro_2025", return: 24.5 },
  { rank: 2, name: "BullMarketKing", return: 22.1 },
  { rank: 3, name: "AlphaInvestor", return: 19.8 },
  { rank: 4, name: "SmartMoney", return: 18.2 },
  { rank: 5, name: "You", return: 12.4 },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<
    { symbol: string; qty: number; avgPrice: number; currentPrice: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<{ x: number; y: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data?.holdings)) {
        setHoldings(
          data.holdings.map((h: { symbol: string; qty: number; avgPrice: number; currentPrice: number }) => ({
            symbol: h.symbol,
            qty: h.qty,
            avgPrice: h.avgPrice,
            currentPrice: h.currentPrice,
          })),
        );
      }
      const chartRes = await fetch("/api/stock?symbol=NIFTY&range=1M");
      const chart = await chartRes.json();
      if (Array.isArray(chart) && chart.length > 0) {
        setPerformanceData(chart.map((d: { close: number }, i: number) => ({ x: i, y: d.close })));
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalInvested = holdings.reduce((sum, s) => sum + s.qty * s.avgPrice, 0);
  const totalValue = holdings.reduce((sum, s) => sum + s.qty * s.currentPrice, 0);
  const profitLoss = totalValue - totalInvested;
  const profitPercent = totalInvested ? ((profitLoss / totalInvested) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-between items-center mb-8 gap-4"
        >
          <h1 className="text-4xl font-bold gradient-text">Portfolio Tracker</h1>
          <div className="flex gap-3">
            <motion.button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 rounded-xl glass border border-cyan-500/30 text-cyan-400 text-sm disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "..." : "⟳ Refresh"}
            </motion.button>
            <Link href="/login">
            <motion.button
              className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login to Sync Portfolio
            </motion.button>
          </Link>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <GlassCard>
            <p className="text-sm text-zinc-400">Total Value</p>
            <p className="text-3xl font-bold text-white mt-1">
              ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-zinc-400">Profit / Loss</p>
            <p className={`text-3xl font-bold mt-1 ${profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </GlassCard>
          <GlassCard>
            <p className="text-sm text-zinc-400">Return %</p>
            <p className={`text-3xl font-bold mt-1 ${Number(profitPercent) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {Number(profitPercent) >= 0 ? "+" : ""}{profitPercent}%
            </p>
          </GlassCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h3 className="text-xl font-bold mb-4">Portfolio / NIFTY Performance</h3>
            {performanceData.length > 0 ? (
              <LineChart data={performanceData} color="#00f5ff" height={280} />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-zinc-500">Loading…</div>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {LEADERBOARD.map((entry, i) => (
                <motion.div
                  key={entry.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex justify-between items-center py-3 px-4 rounded-xl ${
                    entry.name === "You" ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-zinc-400 w-6">#{entry.rank}</span>
                    <span className="font-medium">{entry.name}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">+{entry.return}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h3 className="text-xl font-bold mb-4">Your Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-zinc-400 text-sm border-b border-white/10">
                  <th className="pb-4">Stock</th>
                  <th className="pb-4">Qty</th>
                  <th className="pb-4">Avg Price</th>
                  <th className="pb-4">Current</th>
                  <th className="pb-4">Value</th>
                  <th className="pb-4">P/L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((s) => {
                  const pl = (s.currentPrice - s.avgPrice) * s.qty;
                  const plPct = (((s.currentPrice - s.avgPrice) / s.avgPrice) * 100).toFixed(2);
                  return (
                    <tr key={s.symbol} className="border-b border-white/5">
                      <td className="py-4 font-mono font-semibold">{s.symbol}</td>
                      <td className="py-4">{s.qty}</td>
                      <td className="py-4">₹{s.avgPrice.toFixed(2)}</td>
                      <td className="py-4">₹{s.currentPrice.toFixed(2)}</td>
                      <td className="py-4">
                        ₹
                        {(s.currentPrice * s.qty).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={`py-4 font-medium ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {pl >= 0 ? "+" : ""}₹{pl.toFixed(2)} ({plPct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
