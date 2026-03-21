"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export default function ScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score ?? 0;
  const offset = circumference - (safeScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#22d3ee", glow: "rgba(34,211,238,0.5)", label: "Excellent" };
    if (s >= 60) return { stroke: "#a78bfa", glow: "rgba(167,139,250,0.5)", label: "Good" };
    if (s >= 40) return { stroke: "#fbbf24", glow: "rgba(251,191,36,0.5)", label: "Fair" };
    return { stroke: "#f472b6", glow: "rgba(244,114,182,0.5)", label: "Low" };
  };

  const color = getColor(safeScore);

  if (score === null) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-slate-800/50 bg-slate-900/30"
        style={{ width: size, height: size }}
      >
        <span className="text-[10px] font-medium text-slate-600">N/A</span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30,41,59,0.4)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color.glow})` }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold leading-none"
            style={{ color: color.stroke }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {safeScore}
          </motion.span>
        </div>
      )}
    </div>
  );
}
