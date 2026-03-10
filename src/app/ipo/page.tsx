"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import LineChart from "@/charts/LineChart";

interface IpoItem {
  id?: string;
  name: string;
  symbol?: string;
  priceBand?: string;
  openDate?: string;
  closeDate?: string;
  listedPrice?: number;
}

export default function IPOPage() {
  const [upcoming, setUpcoming] = useState<IpoItem[]>([]);
  const [open, setOpen] = useState<IpoItem[]>([]);
  const [closed, setClosed] = useState<IpoItem[]>([]);
  const [ipoApiConfigured, setIpoApiConfigured] = useState(false);
  const [ipoError, setIpoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ x: number; y: number }[]>([]);
  const [applyFlow, setApplyFlow] = useState<"idle" | "upi" | "confirm">("idle");
  const [selectedIpo, setSelectedIpo] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const upcomingDisplay = upcoming.length > 0 ? upcoming : open;

  useEffect(() => {
    const fetchIpos = async () => {
      try {
        const res = await fetch("/api/ipo");
        const json = await res.json();
        setUpcoming(Array.isArray(json?.upcoming) ? json.upcoming : []);
        setOpen(Array.isArray(json?.open) ? json.open : []);
        setClosed(Array.isArray(json?.closed) ? json.closed : []);
        setIpoApiConfigured(Boolean(json?.apiConfigured));
        setIpoError(typeof json?.error === "string" && json.error.length > 0 ? json.error : null);
      } catch {
        setUpcoming([]);
        setOpen([]);
        setClosed([]);
        setIpoApiConfigured(false);
        setIpoError("Failed to fetch IPO data");
      } finally {
        setLoading(false);
      }
    };
    fetchIpos();
    const res = fetch("/api/stock?symbol=NIFTY&range=1M");
    res.then((r) => r.json()).then((d) => {
      if (Array.isArray(d) && d.length > 0) {
        setChartData(d.map((x: { close: number }, i: number) => ({ x: i, y: x.close })));
      }
    });
  }, []);

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
      // ignore
    } finally {
      setSaving(false);
      setApplyFlow("confirm");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 grid-bg z-0" />
      <ParticleBackground />

      {/* Dynamic Subpage Orbs */}
      <motion.div
        className="fixed top-1/4 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none z-0"
        animate={{ y: [0, 40, 0], x: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0"
        animate={{ y: [0, -50, 0], x: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 py-8 px-6 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl font-bold gradient-text mb-8"
        >
          IPO Section
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-cyan-400">Upcoming IPOs</h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingDisplay.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingDisplay.map((ipo, i) => (
                <motion.div
                  key={ipo.id ?? ipo.name ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-6 glass-hover"
                >
                  <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                  {ipo.priceBand && <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>}
                  {ipo.openDate && <p className="text-sm text-zinc-400 mb-1">Open: {ipo.openDate}</p>}
                  {ipo.closeDate && <p className="text-sm text-zinc-400 mb-4">Close: {ipo.closeDate}</p>}
                  <motion.button
                    className="w-full py-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApply(ipo.name)}
                  >
                    Apply
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">
              {!ipoApiConfigured
                ? "No upcoming IPOs. Add IPO_ALERTS_API_KEY (or STOCKIPOALERT_API_KEY) to .env.local for live IPO data from ipoalerts.in"
                : ipoError
                  ? `Live IPO API error: ${ipoError}`
                  : "No upcoming IPOs right now (live API is connected)."}
            </p>
          )}
          {upcoming.length === 0 && open.length > 0 && (
            <p className="text-xs text-zinc-500 mt-3">Showing currently open IPOs here because upcoming feed is empty on current plan.</p>
          )}
        </GlassCard>
        </motion.div>

        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-white">Current IPOs</h2>
          {open.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {open.map((ipo, i) => (
                <div key={ipo.id ?? ipo.name ?? i} className="glass rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                  {ipo.priceBand && <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>}
                  {ipo.openDate && <p className="text-sm text-zinc-400 mb-1">Open: {ipo.openDate}</p>}
                  {ipo.closeDate && <p className="text-sm text-zinc-400 mb-4">Close: {ipo.closeDate}</p>}
                  <motion.button
                    className="w-full py-3 rounded-lg bg-white/10 text-white border border-white/20 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApply(ipo.name)}
                  >
                    Apply
                  </motion.button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No open IPOs</p>
          )}
        </GlassCard>

        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-6 text-zinc-400">Closed IPOs</h2>
          {closed.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {closed.map((ipo, i) => (
                <div key={ipo.id ?? ipo.name ?? i} className="glass rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-2">{ipo.name}</h3>
                  {ipo.priceBand && <p className="text-sm text-zinc-400 mb-1">Price Band: {ipo.priceBand}</p>}
                  {ipo.listedPrice != null && (
                    <p className="text-sm text-zinc-400">Listed: ₹{ipo.listedPrice}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No closed IPO data</p>
          )}
        </GlassCard>

        <GlassCard className="mb-8">
          <h2 className="text-xl font-bold mb-4">NIFTY Index (Market Context)</h2>
          {chartData.length > 0 ? (
            <LineChart data={chartData} color="#ffffff" height={250} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-zinc-500">Loading…</div>
          )}
        </GlassCard>

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
                  <p className="text-zinc-400 text-sm mb-4">Authorize payment for {selectedIpo} IPO application</p>
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
                      className="flex-1 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      onClick={handleUPIConfirm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saving ? "Authorizing…" : "Authorize"}
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
                    className="w-full py-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
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
