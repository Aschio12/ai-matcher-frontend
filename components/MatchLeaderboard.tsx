"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import CandidateDeepDive from './CandidateDeepDive';

type MatchResult = {
    analysis_json: {
        candidateName: string;
        matchScore: number;
        justification: string;
        key_matches: string[];
        missing_requirements: string[];
        interview_questions?: string[];
        skill_gap_analysis?: { skill: string; status: 'found' | 'missing' | 'partial' }[];
    };
    is_cached?: boolean;
    file_url?: string;
};

type Props = {
    results: MatchResult[];
};

export default function MatchLeaderboard({ results }: Props) {
    const [sortAsc, setSortAsc] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<MatchResult | null>(null);

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
                    const { candidateName, matchScore } = result.analysis_json;
                    const isCached = result.is_cached;

                    return (
                        <div key={idx} className="bg-slate-900/30 transition-colors hover:bg-slate-800/30 group">
                            {/* Main Row */}
                            <div
                                className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                                onClick={() => setSelectedCandidate(result)}
                            >
                                <div className="col-span-1 text-center font-mono text-slate-500">
                                    {idx + 1}
                                </div>
                                <div className="col-span-5 font-medium text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
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
                        </div>
                    );
                })}
            </div>

            {/* Deep Dive Modal */}
            <CandidateDeepDive
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                data={selectedCandidate?.analysis_json!}
                onReAnalyze={() => {
                    // Placeholder for future re-analyze logic
                    alert("Re-analysis feature coming soon!");
                }}
            />
        </div>
    );
}
