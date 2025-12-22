"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Props = {
    score: number;
    size?: number;
    strokeWidth?: number;
};

export default function ProgressRing({ score, size = 120, strokeWidth = 8 }: Props) {
    const [progress, setProgress] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    useEffect(() => {
        // Simple timeout to trigger animation on mount
        const timer = setTimeout(() => setProgress(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const getColor = (val: number) => {
        if (val >= 75) return '#4ade80'; // Green 400
        if (val >= 50) return '#facc15'; // Yellow 400
        return '#f87171'; // Red 400
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Foreground Circle */}
                <motion.circle
                    stroke={getColor(score)}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
            </svg>

            {/* Text Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono transition-colors duration-300">
                    {progress}%
                </span>
                <span className="text-xs uppercase font-bold text-slate-400 mt-1">Match</span>
            </div>
        </div>
    );
}
