"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useTicker } from "@/hooks/useMarketData";
import { useEffect, useRef } from "react";

function CountUp({ value, decimals = 2, prefix = "", suffix = "" }: { value: number, decimals?: number, prefix?: string, suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 60, damping: 20 });
  const isInView = useInView(ref, { once: true, margin: "0px 100px 0px 100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [value, isInView, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [springValue, decimals, prefix, suffix]);

  return <span ref={ref}>{prefix}0.00{suffix}</span>;
}

const DEFAULT_SYMBOLS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT"];

export default function StockTicker() {
  const { data } = useTicker(DEFAULT_SYMBOLS);
  const stocks = data.length > 0 ? data : [];
  const duplicated = [...stocks, ...stocks];

  return (
    <div className="overflow-hidden py-3 border-y border-white/5 bg-[#0a0800]/80 backdrop-blur-md relative z-20">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: duplicated.length ? [0, -2500] : 0 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {duplicated.length > 0 ? (
          duplicated.map((stock, i) => (
            <span key={`${stock.symbol}-${i}`} className="flex items-center gap-4 text-sm font-semibold tracking-wide">
              <span className="text-[#f5c518] font-mono tracking-widest">{stock.symbol}</span>
              <span className="text-[#f0e6c8]">
                <CountUp value={Number(stock.price)} prefix="₹" />
              </span>
              <span className={`flex items-center gap-1 ${Number(stock.changePercent) >= 0 ? "text-[#39d98a]" : "text-[#ff6b6b]"}`}>
                {Number(stock.changePercent) >= 0 ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                )}
                <CountUp value={Math.abs(Number(stock.changePercent))} suffix="%" />
              </span>
            </span>
          ))
        ) : (
          <span className="text-zinc-500 text-sm font-mono tracking-widest">CONNECTING TO MARKET DATACENTER…</span>
        )}
      </motion.div>
    </div>
  );
}
