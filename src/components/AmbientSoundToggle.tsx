"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AmbientSoundToggle() {
  const [available, setAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;

    const setup = async () => {
      try {
        const res = await fetch("/audio/market-ambient.mp3", { method: "HEAD" });
        if (!active || !res.ok) return;
        audioRef.current = new Audio("/audio/market-ambient.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.25;
        setAvailable(true);
      } catch {
        setAvailable(false);
      }
    };

    setup();

    return () => {
      active = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current || !available) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  if (!available) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.button
        onClick={toggleSound}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-12 h-12 flex items-center justify-center rounded-full glass border transition-all ${
          isPlaying ? "border-[#f5c518]/50 shadow-[0_0_20px_rgba(245,197,24,0.3)] bg-[#f5c518]/10" : "border-white/10 hover:border-white/30"
        }`}
        aria-label="Toggle Ambient Sound"
      >
        <div className="flex items-end gap-1 h-4">
          <motion.span 
            animate={isPlaying ? { height: ["20%", "80%", "40%", "100%", "20%"] } : { height: "20%" }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`w-1 rounded-full ${isPlaying ? "bg-[#f5c518]" : "bg-zinc-500"}`} 
          />
          <motion.span 
            animate={isPlaying ? { height: ["60%", "100%", "20%", "80%", "60%"] } : { height: "20%" }} 
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className={`w-1 rounded-full ${isPlaying ? "bg-[#f5c518]" : "bg-zinc-500"}`} 
          />
          <motion.span 
            animate={isPlaying ? { height: ["40%", "20%", "100%", "60%", "40%"] } : { height: "20%" }} 
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className={`w-1 rounded-full ${isPlaying ? "bg-[#f5c518]" : "bg-zinc-500"}`} 
          />
        </div>
      </motion.button>
    </div>
  );
}
