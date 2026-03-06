"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/charts/LineChart";
import { UPCOMING_IPOS, CURRENT_IPOS, CLOSED_IPOS } from "@/utils/mockData";
import { generateLineData } from "@/utils/mockData";

export default function IPOPage() {
  const [applyFlow, setApplyFlow] = useState<"idle" | "upi" | "confirm">("idle");
  const [selectedIpo, setSelectedIpo] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const ipoHistoryData = generateLineData(20);

  const handleApply = (name: string) => {
    setSelectedIpo(name);
    setApplyFlow("upi");
  };

  const handleUPIConfirm = async () => {
    setSaving(true);
    try {
      const numericAmount = Number(amount);
      await fetch("/api/ipo/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipoName: selectedIpo,
          upiId,
          amount: Number.isFinite(numericAmount) ? numericAmount : 0,
        }),
      });
    } catch {
      // ignore – demo only
    } finally {
      setSaving(false);
      setApplyFlow("confirm");
    }
  };

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
          IPO Section
        </motion.h1>

        {/* Upcoming IPOs */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-cyan-400">Upcoming IPOs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_IPOS.map((ipo, i) => (
              <motion.div
                key={ipo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 glass-hover"
              >
                <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>
                <p className="text-sm text-zinc-400 mb-1">Open: {ipo.open}</p>
                <p className="text-sm text-zinc-400 mb-4">Close: {ipo.close}</p>
                <motion.button
                  className="w-full py-3 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApply(ipo.name)}
                >
                  Apply
                </motion.button>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Current IPOs */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-purple-400">Current IPOs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CURRENT_IPOS.map((ipo) => (
              <div key={ipo.name} className="glass rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>
                <p className="text-sm text-zinc-400 mb-1">Open: {ipo.open}</p>
                <p className="text-sm text-zinc-400 mb-4">Close: {ipo.close}</p>
                <motion.button
                  className="w-full py-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/50 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApply(ipo.name)}
                >
                  Apply
                </motion.button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Closed IPOs */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-zinc-400">Closed IPOs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CLOSED_IPOS.map((ipo) => (
              <div key={ipo.name} className="glass rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>
                <p className="text-sm text-zinc-400 mb-1">Listed: ₹{ipo.listedPrice}</p>
                <p className="text-sm text-emerald-400">Current: ₹{ipo.currentPrice}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* IPO History Chart */}
        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-4">IPO Performance History</h2>
          <LineChart data={ipoHistoryData} color="#bf00ff" height={250} />
        </GlassCard>

        {/* Mock Application Flow Modal */}
        {(applyFlow === "upi" || applyFlow === "confirm") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setApplyFlow("idle")}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-8 max-w-md w-full mx-4"
            >
              {applyFlow === "upi" ? (
                <>
                  <h3 className="text-xl font-bold mb-4">UPI Payment Authorization</h3>
                  <p className="text-zinc-400 text-sm mb-4">
                    Authorize payment for {selectedIpo} IPO application
                  </p>
                  <div className="space-y-3 mb-6">
                    <input
                      type="text"
                      placeholder="UPI ID"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                      onClick={handleUPIConfirm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? "Authorizing..." : "Authorize"}
                    </motion.button>
                    <motion.button
                      className="flex-1 py-3 rounded-xl glass text-zinc-400"
                      onClick={() => setApplyFlow("idle")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-3xl">✓</span>
                    </motion.div>
                    <h3 className="text-xl font-bold text-emerald-400">Application Confirmed!</h3>
                    <p className="text-zinc-400 text-sm mt-2">
                      Your IPO application for {selectedIpo} has been submitted successfully.
                    </p>
                  </div>
                  <motion.button
                    className="w-full py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                    onClick={() => setApplyFlow("idle")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Done
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
