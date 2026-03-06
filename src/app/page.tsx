"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";
import CandlestickBackground from "@/components/CandlestickBackground";
import StockTicker from "@/components/StockTicker";
import GlassCard from "@/components/GlassCard";
import { INDICES, generateCandleData, generateLineData } from "@/utils/mockData";
import LineChart from "@/charts/LineChart";
import CandlestickChart from "@/charts/CandlestickChart";
import Globe3D from "@/components/Globe3D";

export default function HomePage() {
  const chartData = generateLineData(40);
  const deepTrendData = generateLineData(80);
  const scrollCandleData = generateCandleData(40);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />
      <CandlestickBackground />

      <StockTicker />

      {/* Hero */}
      <section className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-400 text-sm font-mono mb-4 tracking-widest uppercase"
          >
            AI-Powered Market Intelligence
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="gradient-text text-glow-cyan">MarketPulse</span>
            <span className="text-white"> AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Real-time market data, AI predictions, and intelligent insights for the modern trader
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/dashboard">
              <motion.button
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,245,255,0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Live Dashboard
              </motion.button>
            </Link>
            <Link href="/prediction">
              <motion.button
                className="px-8 py-4 rounded-xl glass glass-hover border border-cyan-500/30 text-cyan-400 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                AI Predictions
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Mini chart */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="w-full max-w-2xl mt-16 mx-auto"
        >
          <GlassCard hover={false} tilt={false}>
            <p className="text-sm text-zinc-400 mb-4">Market Trend Preview</p>
            <LineChart data={chartData} color="#00f5ff" height={180} />
          </GlassCard>
        </motion.div>
      </section>

      {/* Indices */}
      <section className="relative z-10 py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 gradient-text"
        >
          Live Indices
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {INDICES.map((index, i) => (
            <GlassCard key={index.symbol} delay={i * 0.1}>
              <p className="text-sm text-zinc-400">{index.symbol}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {index.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm mt-1 ${index.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {index.change >= 0 ? "+" : ""}{index.change} ({index.changePercent}%)
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3D Globe */}
      <section className="relative z-10 py-12 px-6 flex justify-center">
        <div className="relative">
          <Globe3D />
          <p className="text-center text-sm text-zinc-500 mt-2">Global Markets</p>
        </div>
      </section>

      {/* Scroll-activated market visuals */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <GlassCard className="h-full">
              <p className="text-sm text-cyan-400 mb-2 font-mono tracking-wide uppercase">
                Dynamic Price Action
              </p>
              <h3 className="text-2xl font-bold mb-4">Intraday Liquidity Waves</h3>
              <CandlestickChart data={scrollCandleData} height={260} />
              <div className="mt-6">
                <p className="text-xs text-zinc-500 mb-2">Order flow pressure index</p>
                <LineChart data={deepTrendData} color="#00f5ff" height={120} />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <GlassCard className="h-full flex flex-col">
              <p className="text-sm text-purple-400 mb-2 font-mono tracking-wide uppercase">
                Streaming Market Feed
              </p>
              <h3 className="text-2xl font-bold mb-4">AI-Curated Highlights</h3>
              <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 border border-white/10">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  // Replace this with your own MP4 in /public/videos
                  src="/videos/market-loop.mp4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs text-zinc-300">Live market montage</p>
                  <p className="text-[11px] text-zinc-400">
                    Plug in your own promo / education video via `/public/videos/market-loop.mp4`
                  </p>
                </div>
              </div>
              <p className="text-sm text-zinc-400">
                Scroll to reveal deeper liquidity pockets, volatility regimes, and AI-detected anomalies across
                global markets.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Bull vs Bear */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6">Market Sentiment</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-emerald-400">Bullish</span>
                  <span className="text-zinc-400">68%</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-400">Bearish</span>
                  <span className="text-zinc-400">32%</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full ml-auto"
                    initial={{ width: 0 }}
                    whileInView={{ width: "32%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ marginLeft: "auto" }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-500 mt-4">Based on AI analysis of market data & news sentiment</p>
          </GlassCard>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to trade smarter?</h2>
          <p className="text-zinc-400 mb-8">Create your free account and unlock AI-powered insights</p>
          <Link href="/signup">
            <motion.button
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(191,0,255,0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
