"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import TypingText from "./TypingText";

export default function DynamicHero() {
  const { scrollY } = useScroll();

  // Parallax elements
  const yBg1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const yBg2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yBg3 = useTransform(scrollY, [0, 1000], [0, 300]);
  
  // Diagonal Grid Parallax (shear/shift effect)
  const xGrid = useTransform(scrollY, [0, 1000], [0, -50]);
  const yGrid = useTransform(scrollY, [0, 1000], [0, 100]);

  // Watermark scale & opacity
  const watermarkScale = useTransform(scrollY, [0, 800], [1, 1.5]);
  const watermarkOpacity = useTransform(scrollY, [0, 500], [0.05, 0]);

  // Content Parallax (moves up slightly faster than scroll)
  const yContent = useTransform(scrollY, [0, 500], [0, -50]);
  const opacityContent = useTransform(scrollY, [0, 500], [1, 0]);

  const phrases = [
    "Markets move fast.",
    "We move faster.",
    "Your edge starts here."
  ];

  return (
    <section 
      id="hero-section" 
      className="relative z-10 min-h-screen flex flex-col justify-center px-6 overflow-hidden"
    >
      {/* 1. Diagonal grid background that shifts on scroll */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ 
          backgroundImage: "linear-gradient(45deg, rgba(245,197,24,0.1) 1px, transparent 1px), linear-gradient(-45deg, rgba(245,197,24,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          x: xGrid,
          y: yGrid
        }}
      />

      {/* 2. Floating Glowing Orbs */}
      <motion.div 
        className="absolute top-[20%] left-[15%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none"
        style={{ y: yBg1 }}
      />
      <motion.div 
        className="absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"
        style={{ y: yBg2 }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[40%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none"
        style={{ y: yBg3 }}
      />

      {/* 3. Large Watermark */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
        style={{ scale: watermarkScale, opacity: watermarkOpacity }}
      >
        <span className="text-[30vw] font-bold text-cyan-500/10 whitespace-nowrap tracking-tighter mix-blend-overlay">
          +4.2%
        </span>
      </motion.div>

      {/* 4. Foreground Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pt-20"
        style={{ y: yContent, opacity: opacityContent }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md mb-12 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.8)] animate-pulse" />
          <span className="text-cyan-400 text-sm font-mono tracking-widest uppercase font-semibold">
            Institutional Grade
          </span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.1] mb-8 text-white">
          <span className="block mb-2 text-glow-cyan">MarketPulse AI.</span>
          <span className="block h-[1.3em] gradient-text">
            <TypingText phrases={phrases} typingSpeed={60} deletingSpeed={30} delayBetween={3000} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-16"
        >
          Uncover hidden liquidity profiles and dark pool anomalies before the retail market reacts. 
          Your terminal to the financial elite.
        </motion.p>
      </motion.div>
    </section>
  );
}
