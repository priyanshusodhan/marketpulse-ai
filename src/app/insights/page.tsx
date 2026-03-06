"use client";

import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import MarketHeatmap from "@/charts/MarketHeatmap";
import { GAINERS, LOSERS, SECTOR_PERFORMANCE } from "@/utils/mockData";

export default function InsightsPage() {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          Market Insights
        </motion.h1>

        {/* Bull vs Bear Meter */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6">Bull vs Bear Sentiment Meter</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400 font-medium">Bullish</span>
                <span className="text-zinc-400">68%</span>
              </div>
              <div className="h-6 rounded-full bg-zinc-800 overflow-hidden flex">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full"
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
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
                <span className="text-zinc-400">32%</span>
              </div>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-emerald-400">Bull</span>
              </motion.div>
              <p className="text-sm text-zinc-500 mt-2">Market leaning bullish</p>
            </div>
          </div>
        </GlassCard>

        {/* Sector Performance */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6">Sector Performance</h2>
          <MarketHeatmap />
        </GlassCard>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Top Gainers</h3>
            <div className="space-y-3">
              {GAINERS.map((s, i) => (
                <motion.div
                  key={s.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center py-2 border-b border-white/5"
                >
                  <span className="font-mono">{s.symbol}</span>
                  <span className="text-emerald-400 font-medium">+{s.change}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-red-400">Top Losers</h3>
            <div className="space-y-3">
              {LOSERS.map((s, i) => (
                <motion.div
                  key={s.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center py-2 border-b border-white/5"
                >
                  <span className="font-mono">{s.symbol}</span>
                  <span className="text-red-400 font-medium">{s.change}%</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Market Sentiment Summary */}
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
      </div>
    </div>
  );
}
