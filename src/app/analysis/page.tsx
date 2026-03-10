"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import CandlestickChart from "@/charts/CandlestickChart";
import LineChart from "@/charts/LineChart";
import VolumeChart from "@/charts/VolumeChart";
import { useFullQuote } from "@/hooks/useMarketData";

interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export default function AnalysisPage() {
  const [search, setSearch] = useState("RELIANCE");
  const [activeSymbol, setActiveSymbol] = useState<string | null>("RELIANCE");
  const [candleData, setCandleData] = useState<CandlePoint[]>([]);
  const [lineData, setLineData] = useState<{ x: number; y: number }[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const { quote, loading: quoteLoading, refresh } = useFullQuote(activeSymbol);

  const computeIndicators = (data: CandlePoint[]) => {
    if (data.length < 20) return { ma20: 0, ma50: 0, rsi: 50, volatility: 0 };
    const closes = data.map((d) => d.close);
    const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const ma50 = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : ma20;
    let gains = 0,
      losses = 0;
    for (let i = 1; i < Math.min(15, closes.length); i++) {
      const d = closes[i] - closes[i - 1];
      if (d > 0) gains += d;
      else losses += -d;
    }
    const rs = losses === 0 ? 100 : gains / losses;
    const rsi = 100 - 100 / (1 + rs);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;
    const variance = closes.reduce((s, c) => s + (c - avg) ** 2, 0) / closes.length;
    const volatility = (Math.sqrt(variance) / (avg || 1)) * 100;
    return { ma20, ma50, rsi, volatility };
  };

  const analyze = useCallback(async () => {
    const sym = search.trim().toUpperCase();
    if (!sym) return;
    setActiveSymbol(sym);
    setChartLoading(true);
    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(sym)}&range=1M`);
      const chart = await res.json();
      const candles: CandlePoint[] = Array.isArray(chart) ? chart : [];
      setCandleData(candles);
      setLineData(candles.map((d, i) => ({ x: i, y: d.close })));
    } catch {
      setCandleData([]);
      setLineData([]);
    } finally {
      setChartLoading(false);
    }
  }, [search]);

  const indicators = computeIndicators(candleData);
  const signal =
    indicators.rsi < 30 ? "BUY" : indicators.rsi > 70 ? "SELL" : quote && quote.changePercent > 1 ? "BUY" : "HOLD";
  const bullishProb = Math.round(50 + (quote?.changePercent ?? 0) * 5 + (30 - indicators.rsi));
  const bearishProb = 100 - Math.min(95, Math.max(5, bullishProb));
  const aiConfidence = Math.min(95, Math.round(60 + Math.abs(quote?.changePercent ?? 0) * 2));

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

        <GlassCard className="mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN..."
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
            <motion.button
              onClick={analyze}
              disabled={chartLoading}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-medium disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {chartLoading ? "Loading…" : "Analyze"}
            </motion.button>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{search}</h2>
                  {quote ? (
                    <p className="text-zinc-400">
                      ₹{quote.price.toFixed(2)}{" "}
                      <span className={quote.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {quote.changePercent >= 0 ? "+" : ""}
                        {quote.changePercent.toFixed(2)}%
                      </span>
                    </p>
                  ) : quoteLoading ? (
                    <p className="text-zinc-500">Fetching live price…</p>
                  ) : (
                    <p className="text-zinc-500">Enter symbol & click Analyze</p>
                  )}
                </div>
              </div>
              {chartLoading && candleData.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center bg-white/5 rounded animate-pulse">
                  Loading chart…
                </div>
              ) : candleData.length > 0 ? (
                <>
                  <CandlestickChart data={candleData} height={320} />
                  <div className="mt-4">
                    <VolumeChart data={candleData} height={80} />
                  </div>
                </>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-zinc-500">
                  Try RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN
                </div>
              )}
            </GlassCard>
          </div>

          <div className="space-y-4">
            {quote && (
              <GlassCard>
                <h3 className="font-bold mb-3">Live Quote</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Current</span>
                    <span>₹{quote.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Day High</span>
                    <span>₹{quote.dayHigh.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Day Low</span>
                    <span>₹{quote.dayLow.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Open</span>
                    <span>₹{quote.open.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Prev Close</span>
                    <span>₹{quote.previousClose.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Volume</span>
                    <span>{(quote.volume / 1e6).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Mkt Cap</span>
                    <span>₹{(quote.marketCap / 1e12).toFixed(2)}T</span>
                  </div>
                </div>
              </GlassCard>
            )}
            <GlassCard>
              <h3 className="font-bold mb-4">Technical Indicators</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">RSI (14)</span>
                  <span
                    className={
                      indicators.rsi > 70 ? "text-red-400" : indicators.rsi < 30 ? "text-emerald-400" : "text-white"
                    }
                  >
                    {indicators.rsi.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MA (20)</span>
                  <span>₹{indicators.ma20.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">MA (50)</span>
                  <span>₹{indicators.ma50.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Volatility</span>
                  <span>{indicators.volatility.toFixed(1)}%</span>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-bold mb-4">AI Signal</h3>
              <div
                className={`text-2xl font-bold text-center py-4 rounded-xl ${
                  signal === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : signal === "SELL"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {signal}
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">Based on RSI & trend</p>
            </GlassCard>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <h3 className="font-bold mb-4">Bullish Probability</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">
                  {Math.min(95, Math.max(5, bullishProb))}%
                </span>
              </div>
              <p className="text-sm text-zinc-400">Model predicts upward bias</p>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-bold mb-4">Bearish Probability</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-red-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-red-400">{bearishProb}%</span>
              </div>
              <p className="text-sm text-zinc-400">Model predicts downward bias</p>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="font-bold mb-4">AI Confidence</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/50 flex items-center justify-center">
                <span className="text-2xl font-bold text-cyan-400">{aiConfidence}%</span>
              </div>
              <p className="text-sm text-zinc-400">Confidence in signal</p>
            </div>
          </GlassCard>
        </div>

        {lineData.length > 0 && (
          <GlassCard>
            <h3 className="font-bold mb-4">Price Trend</h3>
            <LineChart data={lineData} color="#00f5ff" height={250} />
          </GlassCard>
        )}
      </div>
    </div>
  );
}
