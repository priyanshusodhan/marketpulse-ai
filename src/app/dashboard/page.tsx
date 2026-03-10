"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import StockTicker from "@/components/StockTicker";
import GlassCard from "@/components/GlassCard";
import CandlestickChart from "@/charts/CandlestickChart";
import LineChart from "@/charts/LineChart";
import VolumeChart from "@/charts/VolumeChart";
import MarketHeatmap from "@/charts/MarketHeatmap";
import AnimatedNumber from "@/components/AnimatedNumber";
import AIMarketBrief from "@/components/AIMarketBrief";
import { useIndices, useMovers, useNifty50 } from "@/hooks/useMarketData";

const RANGE_OPTIONS = ["1D", "1W", "1M", "6M", "1Y", "5Y"];

export default function DashboardPage() {
  const { data: indices, loading: indicesLoading, refresh: refreshIndices } = useIndices();
  const { gainers, losers, loading: moversLoading, refresh: refreshMovers } = useMovers();
  const { data: nifty50, loading: niftyLoading, refresh: refreshNifty } = useNifty50();

  const [range, setRange] = useState("1M");
  const [chartSymbol, setChartSymbol] = useState<"NIFTY" | "RELIANCE">("NIFTY");
  const [candleData, setCandleData] = useState<{ time: number; open: number; high: number; low: number; close: number; volume?: number }[]>([]);
  const [lineData, setLineData] = useState<{ x: number; y: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const validIndices = indices.filter((x) => Number.isFinite(x.value) && x.value > 0).slice(0, 4);

  const fetchCharts = useCallback(async () => {
    setChartLoading(true);
    try {
      const symbol = chartSymbol === "NIFTY" ? "NIFTY" : "RELIANCE";
      const [chartRes, lineRes] = await Promise.all([
        fetch(`/api/stock?symbol=${symbol}&range=${range}`),
        fetch(`/api/stock?symbol=SENSEX&range=${range}`),
      ]);
      const chart = await chartRes.json();
      const line = await lineRes.json();
      setCandleData(Array.isArray(chart) ? chart : []);
      setLineData(
        Array.isArray(line) && line.length > 0
          ? line.map((d: { close: number }, i: number) => ({ x: i, y: d.close }))
          : []
      );
    } catch {
      setCandleData([]);
      setLineData([]);
    } finally {
      setChartLoading(false);
    }
  }, [range, chartSymbol]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const handleRefresh = () => {
    refreshIndices();
    refreshMovers();
    refreshNifty();
    fetchCharts();
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />
      
      {/* Dynamic Subpage Orbs */}
      <motion.div
        className="fixed top-1/4 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none z-0"
        animate={{ y: [0, 50, 0], x: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"
        animate={{ y: [0, -50, 0], x: [0, -30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <StockTicker />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl font-bold gradient-text"
          >
            Live Market Dashboard
          </motion.h1>
          <motion.button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg glass border border-white/20 text-white text-sm font-medium hover:bg-white/5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ⟳ Refresh
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <AIMarketBrief />
        </motion.div>

        {/* Indices */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {(indicesLoading && validIndices.length === 0 ? [{ symbol: "—", value: 0, change: 0, changePercent: 0 }] : validIndices).map((index, i) => (
            <GlassCard key={index.symbol} delay={i * 0.05}>
              <p className="text-sm text-zinc-400">{index.symbol}</p>
              {indicesLoading && validIndices.length === 0 ? (
                <div className="h-8 w-24 bg-white/5 rounded animate-pulse mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-white">
                    <AnimatedNumber value={index.value} />
                  </p>
                  <p className={`text-sm flex gap-1 ${index.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {index.change >= 0 ? "+" : ""}
                    <AnimatedNumber value={index.change} formatFunc={(v) => v.toFixed(2)} /> 
                    ({index.changePercent >= 0 ? "+" : ""}
                    <AnimatedNumber value={index.changePercent} formatFunc={(v) => v.toFixed(2)} />%)
                  </p>
                </>
              )}
            </GlassCard>
          ))}
          {!indicesLoading && validIndices.length === 0 && (
            <div className="col-span-2 lg:col-span-4 text-zinc-500 text-sm px-2">
              Live index feed temporarily unavailable. Click Refresh in a few seconds.
            </div>
          )}
        </motion.div>

        {/* Main Chart + Volume */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {chartSymbol === "NIFTY" ? "NIFTY 50" : "RELIANCE"} - Candlestick
              </h2>
              {(["NIFTY", "RELIANCE"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setChartSymbol(s)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${chartSymbol === s ? "bg-white/20 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {RANGE_OPTIONS.map((r) => (
                <motion.button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    range === r ? "bg-white/20 text-white border border-white/30" : "glass text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {r}
                </motion.button>
              ))}
            </div>
          </div>
          {chartLoading ? (
            <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-xl animate-pulse">
              <span className="text-zinc-400">Loading chart…</span>
            </div>
          ) : candleData.length > 0 ? (
            <>
              <CandlestickChart data={candleData} height={380} />
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Trading Volume</p>
                <VolumeChart data={candleData} height={100} />
              </div>
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-zinc-500">No chart data available</div>
          )}
          </GlassCard>
        </motion.div>

        {/* Line charts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 mb-8"
        >
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-white">SENSEX Trend</h3>
            {lineData.length > 0 ? (
              <LineChart data={lineData} color="#ffffff" height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-500">No data</div>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-cyan-400">NIFTY Trend</h3>
            {lineData.length > 0 ? (
              <LineChart data={lineData} color="#00e5ff" height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-500">No data</div>
            )}
          </GlassCard>
        </motion.div>

        {/* NIFTY 50 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="mb-8">
          <h3 className="text-lg font-bold mb-4">NIFTY 50 Stocks (Live)</h3>
          {niftyLoading && nifty50.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : nifty50.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 max-h-64 overflow-y-auto">
              {nifty50.slice(0, 50).map((s) => (
                <div
                  key={s.symbol}
                  className="flex flex-col py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <span className="font-mono text-sm font-medium">{s.symbol}</span>
                  <span className="text-white text-sm">₹{Number(s.price).toFixed(2)}</span>
                  <span className={`text-xs ${Number(s.changePercent) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {Number(s.changePercent) >= 0 ? "+" : ""}{Number(s.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No NIFTY 50 data</p>
          )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
        >
          <GlassCard className="mb-8">
          <h3 className="text-lg font-bold mb-6">Sector Performance</h3>
            <MarketHeatmap />
          </GlassCard>
        </motion.div>

        {/* Gainers & Losers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-emerald-400">Top Gainers</h3>
            {moversLoading && gainers.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : gainers.length === 0 ? (
              <p className="text-zinc-500 text-sm">No gainers data right now</p>
            ) : (
              <div className="space-y-3">
                {gainers.map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="font-mono font-medium">{stock.symbol}</span>
                    <div className="text-right">
                      <span className="text-zinc-400">₹{Number(stock.price).toFixed(2)}</span>
                      <span className="ml-2 text-emerald-400 font-medium">+{Number(stock.changePercent).toFixed(2)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-red-400">Top Losers</h3>
            {moversLoading && losers.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : losers.length === 0 ? (
              <p className="text-zinc-500 text-sm">No losers data right now</p>
            ) : (
              <div className="space-y-3">
                {losers.map((stock, i) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="font-mono font-medium">{stock.symbol}</span>
                    <div className="text-right">
                      <span className="text-zinc-400">₹{Number(stock.price).toFixed(2)}</span>
                      <span className="ml-2 text-red-400 font-medium">{Number(stock.changePercent).toFixed(2)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
