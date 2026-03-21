"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function GlowCard({
  children,
  className = "",
  glowColor = "rgba(34,211,238,0.06)",
  delay = 0,
  onClick,
  hoverable = true,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.015] ${
        hoverable ? "cursor-pointer transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ boxShadow: `0 0 40px ${glowColor}` }}
      whileHover={hoverable ? { y: -2 } : undefined}
    >
      {children}
    </motion.div>
  );
}
