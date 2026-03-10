"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll } from "framer-motion";

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
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass bg-[#0a0800]/85 border-b border-white/5 py-3" : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative z-50">
            <span className="text-2xl font-bold text-white">MarketPulse</span>
            <span className="text-sm font-medium text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="relative inline-block group px-3 py-2">
                  <motion.span
                    className={`text-sm transition-colors relative z-10 ${
                      isActive ? "text-white font-bold" : "text-zinc-400 hover:text-cyan-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      style={{ boxShadow: "0 0 10px rgba(0, 229, 255, 0.6)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-4 relative z-50">
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white focus:outline-none"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between relative">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 9.5 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full origin-center transition-transform"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-current rounded-full transition-opacity"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -9.5 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full origin-center transition-transform"
                />
              </div>
            </button>
            
            <Link href="/login" className="hidden md:block">
              <motion.span
                className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.span>
            </Link>
            <Link href="/signup" className="hidden md:block">
              <motion.button
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold relative overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 229, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Sign Up</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen Mobile Overlay Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0a0800]/95 backdrop-blur-2xl flex flex-col items-center justify-center min-h-screen"
          >
            <div className="flex flex-col items-center gap-8 w-full px-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.4, ease: "easeOut" }}
                >
                  <Link href={link.href} onClick={() => setMobileOpen(false)}>
                    <span className={`text-3xl font-bold transition-all ${
                      pathname === link.href ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" : "text-zinc-500 hover:text-white"
                    }`}>
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: navLinks.length * 0.05 + 0.2, duration: 0.4 }}
                className="w-full max-w-xs mt-8 flex flex-col gap-4"
              >
                <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 rounded-xl text-lg font-medium text-white border border-white/10 hover:bg-white/5 transition-colors">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  Sign Up
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
