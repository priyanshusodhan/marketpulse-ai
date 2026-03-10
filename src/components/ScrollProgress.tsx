"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 bottom-0 right-0 w-1.5 z-[9998] origin-top bg-gradient-to-b from-[#f5c518] to-[#e8890c] shadow-[0_0_15px_rgba(245,197,24,0.5)]"
      style={{ scaleY }}
    />
  );
}
