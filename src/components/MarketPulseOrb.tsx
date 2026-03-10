"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MarketPulseOrb() {
  const [volatility, setVolatility] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState("#00d4ff");

  useEffect(() => {
    // Fetch indices to determine market mood based on NIFTY change or general index change
    fetch("/api/indices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Find NIFTY or use first index
          const nifty = data.find((d) => d.symbol.includes("NIFTY")) || data[0];
          const absChange = Math.abs(nifty.changePercent || 0);
          
          if (absChange > 1.5) {
            setVolatility("high");
            setColor(nifty.changePercent > 0 ? "#00ff88" : "#ff3264"); // High volatility green/red
          } else if (absChange > 0.5) {
            setVolatility("medium");
            setColor("#00d4ff"); // Medium volatility cyan
          } else {
            setVolatility("low");
            setColor("#7c3aed"); // Low volatility purple
          }
        }
      })
      .catch(() => {});
  }, []);

  const duration = volatility === "high" ? 1.5 : volatility === "medium" ? 3 : 5;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none select-none mix-blend-screen">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 0.9, 1.1, 1], 
          opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
          rotate: [0, 90, 180, 270, 360] 
        }}
        transition={{ duration: duration * 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[400px] h-[400px] md:w-[600px] md:h-[600px] blur-[80px]"
      >
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }} 
        />
        <motion.div 
          className="absolute inset-10 rounded-full mix-blend-overlay"
          animate={{ scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
          style={{ 
            background: `radial-gradient(circle, #ffffff 0%, transparent 40%)`,
            opacity: 0.3
          }} 
        />
      </motion.div>
    </div>
  );
}
