"use client";

import { motion } from "framer-motion";

export default function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden bg-[#0a0800]/50 border border-white/5 backdrop-blur-sm"
      style={{ height }}
    >
      <div className="absolute inset-0">
        <motion.div 
          className="w-[200%] h-full flex"
          animate={{ x: ["-100%", "0%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </motion.div>
      </div>
      
      {/* Grid lines mock */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between py-4 opacity-20 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-px bg-white/10" />
        ))}
      </div>
      
      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[#f5c518]/50 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-t border-[#f5c518] rotate-180 animate-spin" />
          Processing Telemetry
        </span>
      </div>
    </div>
  );
}
