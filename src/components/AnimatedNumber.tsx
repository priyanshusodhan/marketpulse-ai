"use client";

import { useRef } from "react";
import { animate, useInView, useIsomorphicLayoutEffect, useMotionValue, useTransform, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  formatFunc?: (val: number) => string;
  className?: string;
  duration?: number;
  delay?: number;
}

export default function AnimatedNumber({
  value,
  formatFunc = (val) => val.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
  className = "",
  duration = 0.8,
  delay = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  
  // Custom format using useTransform to keep reactivity high
  const formattedText = useTransform(motionValue, (latest) => formatFunc(latest));

  useIsomorphicLayoutEffect(() => {
    if (isInView) {
      animate(motionValue, value, {
        duration,
        delay,
        ease: "easeOut",
      });
    }
  }, [value, isInView, duration, delay, motionValue]);

  return <motion.span ref={ref} className={className}>{formattedText}</motion.span>;
}
