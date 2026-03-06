"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  delay?: number;
}

export default function GlassCard({ children, className = "", hover = true, tilt = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={
        tilt
          ? {
              rotateY: 5,
              rotateX: 5,
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : hover
          ? { scale: 1.02 }
          : undefined
      }
      className={`glass rounded-2xl p-6 ${hover ? "glass-hover" : ""} ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}
