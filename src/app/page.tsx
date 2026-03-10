"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import StockTicker from "@/components/StockTicker";
import GlassCard from "@/components/GlassCard";
import { useIndices, useTicker } from "@/hooks/useMarketData";
import LineChart from "@/charts/LineChart";
import CandlestickChart from "@/charts/CandlestickChart";
import Globe3D from "@/components/Globe3D";
import DynamicHero from "@/components/DynamicHero";
import SkeletonChart from "@/charts/SkeletonChart";
import HeatmapGrid from "@/components/HeatmapGrid";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="py-4 mb-8 w-full"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-baseline gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        {subtitle && (
          <span className="text-cyan-400 font-mono text-sm tracking-widest hidden md:block drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { data: indicesData } = useIndices();
  const { data: watchlistData } = useTicker(["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC", "SBIN"]);
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [scrollCandleData, setScrollCandleData] = useState<{ time: number; open: number; high: number; low: number; close: number }[]>([]);

  // Parallax background
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    fetch("/api/stock?symbol=NIFTY&range=1M")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setChartData(d.map((x: { close: number }, i: number) => ({ x: i, y: x.close })));
        }
      })
      .catch(() => {});
  }, []);
  
  useEffect(() => {
    fetch("/api/stock?symbol=RELIANCE&range=1M")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setScrollCandleData(d);
      })
      .catch(() => {});
  }, []);

  const indices = indicesData;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030308]">
      <motion.div className="fixed inset-0 grid-bg z-0 pointer-events-none mix-blend-screen" style={{ y: yBg }} />

      <div className="relative z-20">
        <StockTicker />
      </div>

      <DynamicHero />

      {/* Global Market Overview */}
      <section className="relative z-10 pb-20">
        <SectionHeader title="Global Markets" subtitle="LIVE TELEMETRY" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <HeatmapGrid />
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-pulse" /> 
              Key Indices
            </h3>
            {indices.length > 0 ? indices.slice(0, 4).map((index: { symbol: string; value: number; change: number; changePercent: number }, i: number) => (
              <GlassCard key={index.symbol} delay={i * 0.1} className="py-4" tilt={false} glowColor={index.change >= 0 ? "emerald" : "red"}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-zinc-400 font-mono">{index.symbol}</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {index.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`text-right ${index.change >= 0 ? "text-[#39d98a]" : "text-[#ff6b6b]"}`}>
                    <p className="text-sm font-bold">
                      {index.change >= 0 ? "+" : ""}{index.changePercent}%
                    </p>
                    <p className="text-xs opacity-70 mt-1">{index.change >= 0 ? "+" : ""}{index.change}</p>
                  </div>
                </div>
              </GlassCard>
            )) : (
              [...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/5 animate-pulse" />)
            )}
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Watchlist */}
      <section className="relative z-10 py-10 w-full overflow-hidden">
        <SectionHeader title="Featured Radar" subtitle="AI DETECTED MOMENTUM" />
        
        <div className="flex overflow-x-auto gap-6 px-6 pb-12 pt-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
          {watchlistData.length > 0 ? watchlistData.map((stock, i) => (
            <div key={stock.symbol} className="snap-center shrink-0 w-[300px] md:w-[400px]">
              <GlassCard delay={i * 0.1} glowColor={stock.changePercent >= 0 ? "emerald" : "red"}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight text-white">{stock.symbol}</h4>
                    <span className="text-xs text-zinc-500 font-mono tracking-widest">EQUITY DERIVATIVE</span>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-sm font-bold bg-black/40 border border-white/5 ${stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-light tracking-tighter text-white">₹{stock.price.toFixed(2)}</span>
                  <button className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold transition-colors cursor-pointer">
                    Analyze
                  </button>
                </div>
              </GlassCard>
            </div>
          )) : (
            [...Array(5)].map((_, i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[400px] h-[160px] rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))
          )}
          {/* Padding element for smooth scroll end */}
          <div className="shrink-0 w-6" />
        </div>
      </section>

      {/* Advanced Interactivity Section */}
      <section className="relative z-10 py-10">
        <SectionHeader title="Market Topography" subtitle="3D VOLUMETRIC SCAN" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="h-full flex flex-col justify-between" glowColor="cyan">
              <div>
                <p className="text-sm text-cyan-400 mb-2 font-mono tracking-wide uppercase">
                  Dynamic Price Action
                </p>
                <h3 className="text-3xl font-bold mb-6 text-white">RELIANCE Volatility Profile</h3>
                {scrollCandleData.length > 0 ? (
                  <CandlestickChart data={scrollCandleData} height={300} />
                ) : (
                  <SkeletonChart height={300} />
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end mb-4">
                  <p className="text-sm text-zinc-400 font-mono tracking-widest">NIFTY 50 Overlay (1M)</p>
                  <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded">CORRELATED</span>
                </div>
                {chartData.length > 0 ? <LineChart data={chartData} color="#00e5ff" height={100} /> : <SkeletonChart height={100} />}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-10"
          >
            <GlassCard className="flex-1" glowColor="purple">
              <p className="text-sm text-purple-400 mb-2 font-mono tracking-wide uppercase">
                Global Context
              </p>
              <h3 className="text-2xl font-bold mb-4 text-white">Macro Topography</h3>
              <div className="relative rounded-2xl overflow-hidden h-64 border border-purple-500/20 bg-[#050510]">
                <Globe3D />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(5,5,16,0.8)]" />
              </div>
            </GlassCard>

            <GlassCard className="flex-1" glowColor="emerald">
              <h3 className="text-xl font-bold mb-6 text-[#f0e6c8]">Market Sentiment Matrix</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#39d98a] font-mono tracking-widest">BULLISH DIVERGENCE</span>
                    <span className="text-white font-bold">68%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#110f00] overflow-hidden border border-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#39d98a] to-[#20a060] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "68%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#ff6b6b] font-mono tracking-widest">BEARISH PRESSURE</span>
                    <span className="text-white font-bold">32%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#110f00] overflow-hidden flex justify-end border border-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-l from-[#ff6b6b] to-[#d04040] rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "32%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md">
            <span className="text-cyan-400 text-xs font-mono uppercase font-semibold tracking-widest">Terminal Access Ready</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">Ready to trade smarter?</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light">
            Create your free account and unlock AI-powered insights, real-time predictions, and unmatched execution speed.
          </p>
          <Link href="/signup">
            <motion.button
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl cursor-pointer relative overflow-hidden group shadow-[0_0_40px_rgba(0,229,255,0.3)]"
              whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(139,92,246,0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 tracking-wide">Initialize Terminal</span>
            </motion.button>
          </Link>
          <p className="mt-6 text-zinc-500 text-sm font-mono tracking-widest uppercase">Press Cmd+K to open universal palette</p>
        </motion.div>
      </section>
    </div>
  );
}
