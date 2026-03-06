"use client";

import { motion } from "framer-motion";
import { SECTOR_PERFORMANCE } from "@/utils/mockData";

export default function MarketHeatmap() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {SECTOR_PERFORMANCE.map((sector, i) => (
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
            {sector.change >= 0 ? "+" : ""}{sector.change}%
          </p>
        </motion.div>
      ))}
    </div>
  );
}
