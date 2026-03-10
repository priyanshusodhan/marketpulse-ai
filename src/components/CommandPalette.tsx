"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTicker } from "@/hooks/useMarketData";

const QUICK_PAGES = [
  { label: "Go to Dashboard", path: "/dashboard" },
  { label: "Go to Analysis", path: "/analysis" },
  { label: "Go to AI Prediction", path: "/prediction" },
  { label: "Go to IPO", path: "/ipo" },
  { label: "Go to Insights", path: "/insights" },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  const { data } = useTicker(["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT"]);

  const runCommand = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery("");
      router.push(path);
    },
    [router],
  );

  const runSymbol = useCallback(
    (symbol: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/analysis?symbol=${encodeURIComponent(symbol)}`);
    },
    [router],
  );
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (e.key === "Enter" && open) {
        e.preventDefault();
        const nextFilteredStocks = data.filter((d) => d.symbol.toLowerCase().includes(query.toLowerCase()));
        const nextFilteredPages = QUICK_PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
        if (query.trim()) {
          if (nextFilteredStocks[0]) {
            runSymbol(nextFilteredStocks[0].symbol);
            return;
          }
          if (nextFilteredPages[0]) {
            runCommand(nextFilteredPages[0].path);
          }
        } else if (QUICK_PAGES[0]) {
          runCommand(QUICK_PAGES[0].path);
        }
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open, query, data, runCommand, runSymbol]);

  const filteredStocks = data.filter((d) => d.symbol.toLowerCase().includes(query.toLowerCase()));
  const filteredPages = QUICK_PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl bg-[#030308]/95 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-cyan-500/10">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks, indices, or commands..."
                className="w-full bg-transparent border-none text-white px-4 py-4 outline-none placeholder:text-zinc-500 font-sans"
              />
              <span className="text-xs text-zinc-500 font-mono border border-zinc-500/30 rounded px-2 py-1">ESC</span>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {query === "" && (
                <>
                  <div className="px-3 py-2 text-xs text-zinc-500 font-semibold tracking-wider uppercase">Quick Actions</div>
                  {QUICK_PAGES.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => runCommand(item.path)}
                      className="w-full px-4 py-3 hover:bg-white/5 rounded-xl text-left cursor-pointer group transition-colors"
                    >
                      <span className="text-sm font-semibold text-zinc-200 group-hover:text-cyan-300">{item.label}</span>
                    </button>
                  ))}

                  <div className="px-3 pt-4 pb-2 text-xs text-zinc-500 font-semibold tracking-wider uppercase">Hot Symbols</div>
                </>
              )}

              {(query ? filteredPages : []).map((item) => (
                <button
                  key={item.path}
                  onClick={() => runCommand(item.path)}
                  className="w-full px-4 py-3 hover:bg-white/5 rounded-xl text-left cursor-pointer group transition-colors"
                >
                  <span className="text-sm font-semibold text-zinc-200 group-hover:text-cyan-300">{item.label}</span>
                </button>
              ))}

              {(query ? filteredStocks : data).map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => runSymbol(stock.symbol)}
                  className="w-full px-4 py-3 hover:bg-white/5 rounded-xl cursor-pointer flex items-center justify-between group transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                      {stock.symbol[0]}
                    </span>
                    <div>
                      <span className="block text-sm font-semibold text-zinc-200">{stock.symbol}</span>
                      <span className="block text-xs text-zinc-500">Open analysis</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-white">₹{stock.price.toFixed(2)}</span>
                    <span className={`block text-xs ${stock.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}

              {query !== "" && filteredStocks.length === 0 && filteredPages.length === 0 && (
                <div className="px-4 py-8 text-center text-zinc-500">
                  <p>No result for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
