"use client";

import { motion } from "framer-motion";
import { useTicker } from "@/hooks/useMarketData";

const DEFAULT_SYMBOLS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT"];

export default function StockTicker() {
  const { data } = useTicker(DEFAULT_SYMBOLS);
  const stocks = data.length > 0 ? data : [];
  const duplicated = [...stocks, ...stocks];

  return (
    <div className="overflow-hidden py-3 border-y border-white/5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: duplicated.length ? [0, -1920] : 0 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {duplicated.length > 0 ? (
          duplicated.map((stock, i) => (
            <span key={`${stock.symbol}-${i}`} className="flex items-center gap-3 text-sm">
              <span className="text-cyan-400 font-mono font-semibold">{stock.symbol}</span>
              <span className="text-zinc-400">₹{Number(stock.price).toFixed(2)}</span>
              <span className={Number(stock.changePercent) >= 0 ? "text-emerald-400" : "text-red-400"}>
                {Number(stock.changePercent) >= 0 ? "+" : ""}
                {Number(stock.changePercent).toFixed(2)}%
              </span>
            </span>
          ))
        ) : (
          <span className="text-zinc-500 text-sm">Fetching live prices…</span>
        )}
      </motion.div>
    </div>
  );
}
