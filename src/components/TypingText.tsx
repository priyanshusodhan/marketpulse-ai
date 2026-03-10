"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypingTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
}

export default function TypingText({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  delayBetween = 2000,
}: TypingTextProps) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const timeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout);
  }, [blink]);

  useEffect(() => {
    if (phrases.length === 0 || index >= phrases.length) return;

    const current = phrases[index];
    const reachedEnd = !isDeleting && subIndex === current.length;
    const reachedStart = isDeleting && subIndex === 0;
    const delay = reachedEnd ? delayBetween : isDeleting ? deletingSpeed : typingSpeed;

    const timeout = setTimeout(() => {
      if (reachedEnd) {
        setIsDeleting(true);
        return;
      }

      if (reachedStart) {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
        return;
      }

      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, phrases, typingSpeed, deletingSpeed, delayBetween]);

  const currentPhrase = phrases[index];
  
  // Choose a different gold/amber shade based on the phrase index
  const getGradient = (i: number) => {
    switch(i % 3) {
      case 0: return "from-[#f5c518] to-[#e8890c]"; // Gold to Amber
      case 1: return "from-[#fff4cc] to-[#f5c518]"; // Cream to Gold
      case 2: return "from-[#e8890c] to-[#f5c518]"; // Amber back to Gold
      default: return "from-[#f5c518] to-[#e8890c]";
    }
  };

  return (
    <div className="inline-flex items-center min-h-[1.5em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-clip-text text-transparent bg-gradient-to-r ${getGradient(index)}`}
        >
          {currentPhrase.substring(0, subIndex)}
        </motion.span>
      </AnimatePresence>
      <span
        className={`inline-block ml-1 w-1 h-[1em] bg-[#f5c518] ${blink ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
      />
    </div>
  );
}
