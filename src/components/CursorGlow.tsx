"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CursorGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    const handleLeave = () => setIsVisible(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9998] w-80 h-80 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          background:
            "radial-gradient(circle, rgba(61,233,255,0.10) 0%, rgba(61,233,255,0.06) 30%, rgba(45,125,255,0.05) 50%, transparent 72%)",
          mixBlendMode: "screen",
        }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
      />
      <motion.div
        className="fixed pointer-events-none z-[9999] w-6 h-6 rounded-full border border-cyan-300/60 -translate-x-1/2 -translate-y-1/2"
        style={{ left: mousePos.x, top: mousePos.y }}
        animate={{
          scale: [1, 1.35, 1],
          opacity: [0.6, 0.95, 0.6],
          borderColor: ["rgba(125,240,255,0.55)", "rgba(255,179,71,0.75)", "rgba(125,240,255,0.55)"],
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </>
  );
}
