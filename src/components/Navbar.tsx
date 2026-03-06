"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analysis", label: "Analysis" },
  { href: "/prediction", label: "AI Prediction" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ipo", label: "IPO" },
  { href: "/insights", label: "Insights" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">MarketPulse</span>
          <span className="text-sm text-cyan-400 font-medium">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.span
                className="px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-cyan-400 transition-colors block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {link.label}
              </motion.span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link href="/login" className="hidden md:block">
            <motion.span
              className="px-4 py-2 text-sm text-zinc-300 hover:text-cyan-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.span>
          </Link>
          <Link href="/signup" className="hidden md:block">
            <motion.button
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <span className="block px-4 py-2 rounded-lg text-sm text-zinc-300 hover:text-cyan-400 hover:bg-white/5">
                    {link.label}
                  </span>
                </Link>
              ))}
              <div className="flex gap-2 mt-2 pt-4 border-t border-white/5">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded-lg text-sm text-zinc-300 hover:text-cyan-400 border border-white/10">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded-lg text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium">
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
