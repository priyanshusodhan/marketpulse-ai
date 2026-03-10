"use client";

import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import MarketHeatmap from "@/charts/MarketHeatmap";
import { useMovers } from "@/hooks/useMarketData";

export default function InsightsPage() {
  const { gainers, losers, loading, refresh } = useMovers();

  const bullPct = gainers.length > losers.length ? 68 : gainers.length < losers.length ? 32 : 50;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />

      {/* Dynamic Subpage Orbs */}
      <motion.div
        className="fixed top-1/4 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none z-0"
        animate={{ y: [0, -30, 0], x: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-1/4 -left-20 w-80 h-80 bg-red-600/20 rounded-full blur-[100px] pointer-events-none z-0"
        animate={{ y: [0, 30, 0], x: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl font-bold gradient-text"
          >
            Market Insights
          </motion.h1>
          <motion.button
            onClick={refresh}
            className="px-4 py-2 rounded-lg glass border border-white/20 text-white text-sm hover:bg-white/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⟳ Refresh
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6">Bull vs Bear Sentiment Meter</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400 font-medium">Bullish</span>
                <span className="text-zinc-400">{bullPct}%</span>
              </div>
              <div className="h-6 rounded-full bg-zinc-800 overflow-hidden flex">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bullPct}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
                <motion.div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-r-full flex-1"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-red-400 font-medium">Bearish</span>
                <span className="text-zinc-400">{100 - bullPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-emerald-400">{bullPct >= 50 ? "Bull" : "Bear"}</span>
              </motion.div>
              <p className="text-sm text-zinc-500 mt-2">Market leaning {bullPct >= 50 ? "bullish" : "bearish"}</p>
            </div>
          </div>
        </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6">Sector Performance</h2>
          <MarketHeatmap />
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Top Gainers</h3>
            {loading && gainers.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {gainers.map((s, i) => (
                  <motion.div
                    key={s.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex justify-between items-center py-2 border-b border-white/5"
                  >
                    <span className="font-mono">{s.symbol}</span>
                    <span className="text-emerald-400 font-medium">+{Number(s.changePercent).toFixed(2)}%</span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-red-400">Top Losers</h3>
            {loading && losers.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {losers.map((s, i) => (
                  <motion.div
                    key={s.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex justify-between items-center py-2 border-b border-white/5"
                  >
                    <span className="font-mono">{s.symbol}</span>
                    <span className="text-red-400 font-medium">{Number(s.changePercent).toFixed(2)}%</span>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
          <h2 className="text-xl font-bold mb-4">Market Sentiment Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-zinc-400">Positive Factors</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">Strong earnings, FII inflows</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-zinc-400">Neutral Factors</p>
              <p className="text-lg font-bold text-amber-400 mt-1">Global cues, RBI policy</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-zinc-400">Risks</p>
              <p className="text-lg font-bold text-red-400 mt-1">Geopolitical tensions</p>
            </div>
          </div>
        </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
