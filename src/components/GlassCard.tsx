"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MouseEvent, useRef } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  delay?: number;
  glowColor?: "cyan" | "emerald" | "red" | "purple"; // Retained names for backwards compatibility across pages, but values are gold/mint/etc
}

export default function GlassCard({ children, className = "", hover = true, tilt = true, delay = 0, glowColor = "cyan" }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [0, 1], [-15, 15]);

  const glowX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  
  // Mapping names to cyber palette
  const colors = {
    cyan: "rgba(0, 229, 255, 0.15)",     // Electric Cyan
    emerald: "rgba(16, 185, 129, 0.15)", // Green
    red: "rgba(244, 63, 94, 0.15)",      // Neon Red
    purple: "rgba(139, 92, 246, 0.15)"   // Deep Violet
  };

  const spotlightBackground = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(1000px circle at ${x} ${y}, ${colors[glowColor]}, transparent 40%)`
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const getBorderColor = () => {
    switch (glowColor) {
      case "emerald": return "group-hover:border-emerald-500/60";
      case "red": return "group-hover:border-rose-500/60";
      case "purple": return "group-hover:border-purple-500/60";
      default: return "group-hover:border-cyan-500/60";
    }
  };

  const getShadowColor = () => {
    switch (glowColor) {
      case "emerald": return "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]";
      case "red": return "group-hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]";
      case "purple": return "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]";
      default: return "group-hover:shadow-[0_0_40px_rgba(0,229,255,0.3)]";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative group rounded-2xl p-6 transition-all duration-300 ${className} ${
        hover ? `cursor-pointer border border-cyan-500/10 bg-[#0a0a1a]/60 backdrop-blur-xl ${getShadowColor()}` : "glass bg-[#050510]/50"
      }`}
    >
      {hover && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"
          style={{ background: spotlightBackground }}
        />
      )}

      {hover && (
        <div className={`absolute inset-0 z-0 pointer-events-none border border-white/5 rounded-2xl transition-colors duration-500 ${getBorderColor()}`} />
      )}

      <div className="relative z-10 h-full" style={{ transform: tilt ? "translateZ(40px)" : "translateZ(0)" }}>
        {children}
      </div>
    </motion.div>
  );
}
