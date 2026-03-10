"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Sector {
  name: string;
  change: number;
  color: string;
}

export default function MarketHeatmap() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sectors");
        const json = await res.json();
        setSectors(Array.isArray(json) ? json : []);
      } catch {
        setSectors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading && sectors.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (sectors.length === 0) return <p className="text-zinc-500 text-sm">No sector data</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {sectors.map((sector, i) => (
        <motion.div
          key={sector.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.05 }}
          className="glass rounded-xl p-4 text-center cursor-pointer glass-hover"
        >
          <div
            className="w-full h-2 rounded-full mb-2 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: sector.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.abs(sector.change) * 25)}%` }}
              transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
            />
          </div>
          <p className="text-sm font-medium text-zinc-300">{sector.name}</p>
          <p
            className={`text-sm font-bold ${
              sector.change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%
          </p>
        </motion.div>
      ))}
    </div>
  );
}
