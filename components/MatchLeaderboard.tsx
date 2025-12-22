"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

type MatchResult = {
    analysis_json: {
        candidateName: string;
        matchScore: number;
        justification: string;
        key_matches: string[];
        missing_requirements: string[];
    };
    is_cached?: boolean;
    file_url?: string;
};

type Props = {
    results: MatchResult[];
};

export default function MatchLeaderboard({ results }: Props) {
    const [sortAsc, setSortAsc] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Sort results by score
    const sortedResults = [...results].sort((a, b) => {
        const scoreA = a.analysis_json.matchScore;
        const scoreB = b.analysis_json.matchScore;
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
    });

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (score >= 50) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        return 'text-red-400 bg-red-400/10 border-red-400/20';
    };

    return (
        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800/80 border-b border-slate-700 text-sm font-semibold text-slate-300">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Candidate</div>
                <div
                    className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-white transition-colors"
                    onClick={() => setSortAsc(!sortAsc)}
                >
                    Match Score
                    {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                <div className="col-span-3 text-right">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800">
                {sortedResults.map((result, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const { candidateName, matchScore, justification, key_matches, missing_requirements } = result.analysis_json;
                    const isCached = result.is_cached;

                    return (
                        <div key={idx} className="bg-slate-900/30 transition-colors hover:bg-slate-800/30">
                            {/* Main Row */}
                            <div
                                className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            >
                                <div className="col-span-1 text-center font-mono text-slate-500">
                                    {idx + 1}
                                </div>
                                <div className="col-span-5 font-medium text-slate-200 truncate">
                                    {candidateName || "Unknown Candidate"}
                                </div>
                                <div className="col-span-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(matchScore)}`}>
                                        {matchScore}% Match
                                    </span>
                                </div>
                                <div className="col-span-3 flex justify-end">
                                    {isCached ? (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                                            <Zap className="w-3 h-3" /> Cached
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20">
                                            <Sparkles className="w-3 h-3" /> New
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-slate-950/30"
                                    >
                                        <div className="p-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Analysis Summary</h4>
                                                    <p className="text-slate-300 text-sm leading-relaxed italic">"{justification}"</p>
                                                </div>
                                                <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                                    <h4 className="flex items-center gap-2 text-green-400 text-sm font-semibold mb-2">
                                                        <CheckCircle className="w-4 h-4" /> Key Strengths
                                                    </h4>
                                                    <ul className="text-sm text-slate-400 space-y-1">
                                                        {key_matches?.slice(0, 3).map((m, i) => (
                                                            <li key={i}>• {m}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                                    <h4 className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
                                                        <AlertTriangle className="w-4 h-4" /> Missing / Gaps
                                                    </h4>
                                                    <ul className="text-sm text-slate-400 space-y-1">
                                                        {missing_requirements?.slice(0, 3).map((m, i) => (
                                                            <li key={i}>• {m}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
