"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import StockTicker from "@/components/StockTicker";
import GlassCard from "@/components/GlassCard";
import CandlestickChart from "@/charts/CandlestickChart";
import LineChart from "@/charts/LineChart";
import MarketHeatmap from "@/charts/MarketHeatmap";
import {
  INDICES,
  GAINERS,
  LOSERS,
  generateCandleData,
  generateLineData,
} from "@/utils/mockData";

const RANGE_OPTIONS = ["1D", "1W", "1M", "1Y", "5Y"];

export default function DashboardPage() {
  const [range, setRange] = useState("1M");
  const [candleData, setCandleData] = useState(generateCandleData(30));
  const [lineData, setLineData] = useState(generateLineData(50));

  useEffect(() => {
    const days = range === "1D" ? 1 : range === "1W" ? 7 : range === "1M" ? 30 : range === "1Y" ? 365 : 365 * 5;
    setCandleData(generateCandleData(days));
    setLineData(generateLineData(Math.min(days, 100)));
  }, [range]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />
      <StockTicker />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          Live Market Dashboard
        </motion.h1>

        {/* Indices */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {INDICES.map((index, i) => (
            <GlassCard key={index.symbol} delay={i * 0.05}>
              <p className="text-sm text-zinc-400">{index.symbol}</p>
              <p className="text-2xl font-bold text-white">
                {index.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${index.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {index.change >= 0 ? "+" : ""}{index.change} ({index.changePercent}%)
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Main Chart */}
        <GlassCard className="mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-xl font-bold">NIFTY 50 - Candlestick</h2>
            <div className="flex gap-2">
              {RANGE_OPTIONS.map((r) => (
                <motion.button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    range === r
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                      : "glass text-zinc-400 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>
          <CandlestickChart data={candleData} height={400} />
        </GlassCard>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4">Trading Volume</h3>
            <LineChart data={lineData} color="#bf00ff" height={250} />
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4">SENSEX Trend</h3>
            <LineChart data={lineData} color="#0066ff" height={250} />
          </GlassCard>
        </div>

        {/* Market Heatmap */}
        <GlassCard className="mb-8">
          <h3 className="text-lg font-bold mb-6">Sector Performance Heatmap</h3>
          <MarketHeatmap />
        </GlassCard>

        {/* Gainers & Losers */}
        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Top Gainers</h3>
            <div className="space-y-3">
              {GAINERS.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                >
                  <span className="font-mono font-medium">{stock.symbol}</span>
                  <div className="text-right">
                    <span className="text-zinc-400">₹{stock.price.toFixed(2)}</span>
                    <span className="ml-2 text-emerald-400 font-medium">+{stock.change}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-red-400">Top Losers</h3>
            <div className="space-y-3">
              {LOSERS.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                >
                  <span className="font-mono font-medium">{stock.symbol}</span>
                  <div className="text-right">
                    <span className="text-zinc-400">₹{stock.price.toFixed(2)}</span>
                    <span className="ml-2 text-red-400 font-medium">{stock.change}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
