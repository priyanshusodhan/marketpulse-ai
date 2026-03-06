"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/charts/LineChart";

const HORIZONS = ["1 Week", "1 Month", "6 Months", "1 Year"];

function generatePredictionCurve(horizon: string) {
  const points = horizon === "1 Week" ? 7 : horizon === "1 Month" ? 30 : horizon === "6 Months" ? 26 : 52;
  const data = [];
  let y = 100;
  const trend = 0.02 + Math.random() * 0.03;
  for (let i = 0; i <= points; i++) {
    y += trend + (Math.random() - 0.5) * 2;
    data.push({ x: i, y: Math.max(90, Math.min(130, y)) });
  }
  return data;
}

export default function PredictionPage() {
  const [horizon, setHorizon] = useState("1 Month");
  const [stock, setStock] = useState("RELIANCE");
  const predictionData = generatePredictionCurve(horizon);

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
          AI Price Prediction
        </motion.h1>

        <GlassCard className="mb-8">
          <p className="text-sm text-cyan-400 mb-2">Machine Learning Model • Placeholder</p>
          <p className="text-zinc-400 text-sm">
            Our AI model analyzes historical patterns, market sentiment, and technical indicators to generate price forecasts.
            Connect your Alpha Vantage or Yahoo Finance API for live predictions.
          </p>
        </GlassCard>

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="text"
            value={stock}
            onChange={(e) => setStock(e.target.value.toUpperCase())}
            placeholder="Stock symbol"
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white w-40"
          />
          {HORIZONS.map((h) => (
            <motion.button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                horizon === h
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                  : "glass text-zinc-400 hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {h}
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h3 className="text-xl font-bold mb-4">Predicted Price Curve - {stock}</h3>
            <p className="text-sm text-zinc-400 mb-4">Time horizon: {horizon}</p>
            <LineChart data={predictionData} color="#bf00ff" height={350} />
          </GlassCard>
          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-bold mb-4">Confidence Bands</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Upper bound (90%)</span>
                  <span className="text-emerald-400">₹2,680</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Expected price</span>
                  <span className="text-cyan-400">₹2,520</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Lower bound (90%)</span>
                  <span className="text-red-400">₹2,380</span>
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-bold mb-4">Probability Ranges</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Upside &gt; 5%</span>
                    <span className="text-emerald-400">72%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "72%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stable ±5%</span>
                    <span className="text-amber-400">18%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "18%" }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Downside &gt; 5%</span>
                    <span className="text-red-400">10%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "10%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <GlassCard>
          <h3 className="font-bold mb-4">AI Prediction Wave</h3>
          <div className="h-32 flex items-center justify-center overflow-hidden">
            <motion.div
              className="w-full h-20 rounded-lg bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
          <p className="text-sm text-zinc-500 mt-4 text-center">
            Continuous model updates with real-time market data
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
