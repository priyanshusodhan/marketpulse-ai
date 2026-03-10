"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Sector {
  name: string;
  change: number;
  color: string;
}

export default function HeatmapGrid() {
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetch("/api/sectors")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSectors(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sector Heatmap</h3>
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
          Live Neural Scan
        </span>
      </div>
      
      {sectors.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sectors.map((sector, i) => {
            const isPositive = sector.change >= 0;
            // The intensity scales based on the change, mapped to opacity 0.2 -> 0.8
            const intensity = Math.min(Math.max(Math.abs(sector.change) / 3, 0.2), 0.8);
            
            return (
              <motion.div
                key={sector.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="relative overflow-hidden rounded-xl border border-white/5 p-4 flex flex-col justify-between aspect-video group cursor-pointer"
              >
                {/* Background varying intensity */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
                  style={{ 
                    backgroundColor: isPositive ? `rgba(57, 217, 138, ${intensity})` : `rgba(255, 107, 107, ${intensity})` 
                  }}
                />
                
                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/80 to-transparent pointer-events-none" />

                <div className="relative z-10 flex justify-between items-start">
                  <p className="font-bold text-white text-sm md:text-base tracking-wide">{sector.name}</p>
                </div>
                
                <div className="relative z-10">
                  <p className={`text-xl md:text-2xl font-light ${isPositive ? "text-white" : "text-white"}`}>
                    {isPositive ? "+" : ""}{sector.change.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <motion.div 
              key={i} 
              className="rounded-xl border border-white/5 bg-white/5 aspect-video animate-pulse"
              initial={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
