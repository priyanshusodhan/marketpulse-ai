"use client";

import { motion } from "framer-motion";

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Aurora Gradient */}
      <div className="absolute inset-0 aurora-bg opacity-40 mix-blend-screen" />
      
      {/* Floating volumetric orbs to give depth */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen"
        animate={{ 
          x: [0, 50, -20, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen"
        animate={{ 
          x: [0, -60, 30, 0],
          y: [0, 40, -50, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}
