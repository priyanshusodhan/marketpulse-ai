"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import CandlestickChart from "@/charts/CandlestickChart";
import LineChart from "@/charts/LineChart";
import { generateCandleData, generateLineData } from "@/utils/mockData";

export default function AnalysisPage() {
  const [search, setSearch] = useState("RELIANCE");
  const [stockData] = useState({
    price: 2456.78,
    change: 1.24,
    rsi: 58.3,
    macd: 12.45,
    ma20: 2420.5,
    ma50: 2380.2,
    volatility: 18.5,
    signal: "BUY" as const,
    bullishProb: 72,
    bearishProb: 28,
    aiConfidence: 85,
    predictedPrice: 2520,
  });

  const candleData = generateCandleData(30);
  const lineData = generateLineData(40);

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
          Stock Analysis
        </motion.h1>

        {/* Search */}
        <GlassCard className="mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              placeholder="Search stock (e.g. RELIANCE, TCS)"
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
            <motion.button
              className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Analyze
            </motion.button>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{search}</h2>
                  <p className="text-zinc-400">
                    ₹{stockData.price.toFixed(2)}{" "}
                    <span className={stockData.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                      {stockData.change >= 0 ? "+" : ""}{stockData.change}%
                    </span>
                  </p>
                </div>
              </div>
              <CandlestickChart data={candleData} height={350} />
            </GlassCard>
          </div>

          {/* Indicators */}
          <div className="space-y-4">
            <GlassCard>
              <h3 className="font-bold mb-4">Technical Indicators</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">RSI (14)</span>
                  <span className={stockData.rsi > 70 ? "text-red-400" : stockData.rsi < 30 ? "text-emerald-400" : "text-white"}>{stockData.rsi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MACD</span>
                  <span>{stockData.macd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MA (20)</span>
                  <span>₹{stockData.ma20.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MA (50)</span>
                  <span>₹{stockData.ma50.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Volatility</span>
                  <span>{stockData.volatility}%</span>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-bold mb-4">AI Signal</h3>
              <div className={`text-2xl font-bold text-center py-4 rounded-xl ${
                stockData.signal === "BUY" ? "bg-emerald-500/20 text-emerald-400" :
                stockData.signal === "SELL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {stockData.signal}
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">Expected: ₹{stockData.predictedPrice}</p>
            </GlassCard>
          </div>
        </div>

        {/* Probability & Confidence */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <h3 className="font-bold mb-4">Bullish Probability</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">{stockData.bullishProb}%</span>
              </div>
              <p className="text-sm text-zinc-400">AI predicts upward movement</p>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-bold mb-4">Bearish Probability</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-red-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-400">{stockData.bearishProb}%</span>
              </div>
              <p className="text-sm text-zinc-400">AI predicts downward movement</p>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-bold mb-4">AI Confidence Score</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">{stockData.aiConfidence}%</span>
              </div>
              <p className="text-sm text-zinc-400">Model confidence in prediction</p>
            </div>
          </GlassCard>
        </div>

        {/* RSI Chart */}
        <GlassCard>
          <h3 className="font-bold mb-4">Price with Moving Averages</h3>
          <LineChart data={lineData} color="#00f5ff" height={250} />
        </GlassCard>
      </div>
    </div>
  );
}
