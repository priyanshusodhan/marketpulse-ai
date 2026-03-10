"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/charts/LineChart";

const HORIZONS = [
  { label: "1 Week", key: "1W" },
  { label: "1 Month", key: "1M" },
  { label: "6 Months", key: "6M" },
  { label: "1 Year", key: "1Y" },
] as const;

type HorizonLabel = (typeof HORIZONS)[number]["label"];

interface PredictionResponse {
  symbol: string;
  horizon: string;
  model: string;
  lastPrice: number;
  prediction: { x: number; y: number }[];
  upperBand: { x: number; y: number }[];
  lowerBand: { x: number; y: number }[];
  confidenceWave: number[];
  metrics: {
    expectedPrice: number;
    expectedChangePct: number;
    upperPrice: number;
    lowerPrice: number;
    upsideProb: number;
    stableProb: number;
    downsideProb: number;
    confidence: number;
    signal: "BUY" | "SELL" | "HOLD";
  };
}

function fmtInr(v: number) {
  if (!Number.isFinite(v)) return "--";
  return `\u20b9${v.toFixed(2)}`;
}

export default function PredictionPage() {
  const [horizon, setHorizon] = useState<HorizonLabel>("1 Month");
  const [stockInput, setStockInput] = useState("RELIANCE");
  const [activeStock, setActiveStock] = useState("RELIANCE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [modelName, setModelName] = useState("Probabilistic Trend Model");
  const [predictionData, setPredictionData] = useState<{ x: number; y: number }[]>([]);
  const [waveBars, setWaveBars] = useState<number[]>([]);
  const [metrics, setMetrics] = useState<PredictionResponse["metrics"] | null>(null);

  const horizonKey = useMemo(() => HORIZONS.find((h) => h.label === horizon)?.key ?? "1M", [horizon]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/prediction?symbol=${encodeURIComponent(activeStock)}&horizon=${encodeURIComponent(horizonKey)}`,
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(typeof json?.error === "string" ? json.error : "Prediction unavailable");
        }

        const data = json as PredictionResponse;
        if (cancelled) return;

        setPredictionData(Array.isArray(data.prediction) ? data.prediction : []);
        setWaveBars(Array.isArray(data.confidenceWave) ? data.confidenceWave : []);
        setMetrics(data.metrics ?? null);
        setModelName(data.model || "Probabilistic Trend Model");
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (e) {
        if (cancelled) return;
        setPredictionData([]);
        setWaveBars([]);
        setMetrics(null);
        setError(e instanceof Error ? e.message : "Prediction unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [activeStock, horizonKey]);

  const runAnalysis = () => {
    const sym = stockInput.trim().toUpperCase();
    if (!sym) return;
    setActiveStock(sym);
  };

  const signalClass =
    metrics?.signal === "BUY"
      ? "bg-emerald-500/20 text-emerald-400"
      : metrics?.signal === "SELL"
        ? "bg-red-500/20 text-red-400"
        : "bg-amber-500/20 text-amber-400";

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />

      {/* Dynamic Subpage Orbs */}
      <motion.div
        className="fixed top-1/3 -left-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none z-0"
        animate={{ y: [0, 40, 0], x: [0, 20, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none z-0"
        animate={{ y: [0, -40, 0], x: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          AI Price Prediction
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-8 relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/50 to-purple-500/50 shadow-[0_0_40px_rgba(0,229,255,0.15)] group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative h-full bg-[#030308]/90 backdrop-blur-2xl rounded-2xl p-6 border border-white/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <p className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
              {modelName}
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Forecast uses historical log-return trend + volatility bands from live market data.
            </p>
            {lastUpdated && <p className="text-xs text-zinc-500 mt-3 font-mono">Last updated: {lastUpdated}</p>}
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
            placeholder="Stock symbol"
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white w-44"
          />
          {HORIZONS.map((h) => (
            <motion.button
              key={h.label}
              onClick={() => setHorizon(h.label)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                horizon === h.label
                  ? "bg-white/20 text-white border border-white/50"
                  : "glass text-zinc-400 hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {h.label}
            </motion.button>
          ))}
          <motion.button
            onClick={runAnalysis}
            className="px-5 py-3 rounded-xl bg-white/10 text-white border border-white/20 text-sm font-medium hover:bg-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Run Forecast
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 mb-8"
        >
          <GlassCard>
            <h3 className="text-xl font-bold mb-4">Forecast Curve - {activeStock}</h3>
            <p className="text-sm text-zinc-400 mb-4">Horizon: {horizon}</p>
            {loading ? (
              <div className="h-[350px] rounded-xl bg-white/5 animate-pulse" />
            ) : predictionData.length > 0 ? (
              <LineChart data={predictionData} color="#ffffff" height={350} />
            ) : (
              <div className="h-[350px] flex items-center justify-center text-zinc-500 text-sm text-center px-8">
                {error ?? "Prediction unavailable"}
              </div>
            )}
          </GlassCard>
          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-bold mb-4">Confidence Bands</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Upper band (80%)</span>
                  <span className="text-emerald-400">{fmtInr(metrics?.upperPrice ?? NaN)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Expected price</span>
                  <span className="text-white">{fmtInr(metrics?.expectedPrice ?? NaN)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Lower band (80%)</span>
                  <span className="text-red-400">{fmtInr(metrics?.lowerPrice ?? NaN)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Expected return</span>
                  <span className={(metrics?.expectedChangePct ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {(metrics?.expectedChangePct ?? 0) >= 0 ? "+" : ""}
                    {(metrics?.expectedChangePct ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-bold mb-4">Probability Ranges</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Upside &gt; 5%</span>
                    <span className="text-emerald-400">{Math.round(metrics?.upsideProb ?? 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(metrics?.upsideProb ?? 0)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stable ±5%</span>
                    <span className="text-amber-400">{Math.round(metrics?.stableProb ?? 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(metrics?.stableProb ?? 0)}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Downside &gt; 5%</span>
                    <span className="text-red-400">{Math.round(metrics?.downsideProb ?? 0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(metrics?.downsideProb ?? 0)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-bold mb-4">Model Signal</h3>
              <div className={`text-2xl font-bold text-center py-4 rounded-xl ${signalClass}`}>
                {metrics?.signal ?? "HOLD"}
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">
                Confidence: {Math.round(metrics?.confidence ?? 0)}%
              </p>
            </GlassCard>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard>
          <h3 className="font-bold mb-4">AI Prediction Wave</h3>
          <div className="relative h-36 overflow-hidden rounded-xl border border-white/10 bg-black/20">
            <motion.div
              className="absolute -left-1/2 top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-20%", "20%", "-20%"] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-end gap-[3px] px-3 pb-3 pointer-events-none">
              {(waveBars.length > 0 ? waveBars : Array.from({ length: 40 }, () => 35)).map((h, i) => (
                <motion.div
                  key={`${h}-${i}`}
                  className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500 to-purple-400 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                  style={{ height: `${h}%` }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{ duration: 1.6 + (i % 7) * 0.15, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-4 text-center">
            Bars represent per-step forecast confidence over the selected horizon.
          </p>
          <p className="text-xs text-zinc-600 mt-1 text-center">
            Taller bars = higher confidence (lower uncertainty); shorter bars = higher uncertainty.
          </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
