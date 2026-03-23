"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Standardize easing curve for smooth, premium feel across all animations
export const ANIMATION_EASING: [number, number, number, number] = [0.16, 1, 0.3, 1]; // Custom snappier out-expo

interface AnimatedRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedReveal({ 
  children, 
  delay = 0, 
  duration = 0.7,
  className = "" 
}: AnimatedRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: ANIMATION_EASING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// For text animations with character reveal
export function AnimatedText({ 
  children, 
  delay = 0,
  className = "" 
}: AnimatedRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: ANIMATION_EASING,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// For number counters
interface AnimatedNumberProps {
  value: number;
  delay?: number;
  className?: string;
  formatter?: (val: number) => string;
}

export function AnimatedNumber({ 
  value, 
  delay = 0,
  className = "",
  formatter = (val) => val.toLocaleString()
}: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: ANIMATION_EASING,
      }}
      className={className}
    >
      {formatter(value)}
    </motion.span>
  );
}
