"use client";

import { motion } from "framer-motion";
import { TICKER_STOCKS } from "@/utils/mockData";

export default function StockTicker() {
  const duplicated = [...TICKER_STOCKS, ...TICKER_STOCKS];

  return (
    <div className="overflow-hidden py-3 border-y border-white/5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1920] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {duplicated.map((stock, i) => (
          <span key={i} className="flex items-center gap-3 text-sm">
            <span className="text-cyan-400 font-mono font-semibold">{stock.symbol}</span>
            <span className="text-zinc-400">₹{stock.price.toFixed(2)}</span>
            <span className={stock.change >= 0 ? "text-emerald-400" : "text-red-400"}>
              {stock.change >= 0 ? "+" : ""}{stock.change}%
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
