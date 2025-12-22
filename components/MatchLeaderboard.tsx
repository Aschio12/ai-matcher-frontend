"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Sparkles, CheckCircle, AlertTriangle, Download, BarChart3, Users } from 'lucide-react';
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
    isLoading?: boolean;
};

export default function MatchLeaderboard({ results, isLoading = false }: Props) {
    const [sortAsc, setSortAsc] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<MatchResult | null>(null);

    // Stats
    const totalCandidates = results.length;
    const avgScore = totalCandidates > 0
        ? Math.round(results.reduce((acc, curr) => acc + curr.analysis_json.matchScore, 0) / totalCandidates)
        : 0;
    const topMatch = totalCandidates > 0
        ? Math.max(...results.map(r => r.analysis_json.matchScore))
        : 0;

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

    const handleExportCSV = () => {
        const headers = ["Candidate Name", "Match Score", "Justification", "Key Strengths", "Missing Skills"];
        const rows = results.map(r => [
            r.analysis_json.candidateName,
            r.analysis_json.matchScore,
            `"${r.analysis_json.justification.replace(/"/g, '""')}"`,
            `"${r.analysis_json.key_matches.join(', ')}"`,
            `"${r.analysis_json.missing_requirements.join(', ')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'Match_Leaderboard_Export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Analysis Overview Stats */}
            {!isLoading && results.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase font-bold">Total Candidates</p>
                            <p className="text-2xl font-bold text-slate-100">{totalCandidates}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase font-bold">Average Score</p>
                            <p className="text-2xl font-bold text-slate-100">{avgScore}%</p>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase font-bold">Top Match</p>
                            <p className="text-2xl font-bold text-slate-100">{topMatch}%</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
                {/* Header with Export */}
                <div className="flex justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300">Candidate Rankings</h3>
                    {!isLoading && results.length > 0 && (
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                    )}
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800/50 border-b border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-5">Candidate Name</div>
                    <div
                        className="col-span-3 cursor-pointer flex items-center gap-1 hover:text-white transition-colors"
                        onClick={() => setSortAsc(!sortAsc)}
                    >
                        Score
                        {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </div>
                    <div className="col-span-3 text-right">Data Source</div>
                </div>

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="divide-y divide-slate-800 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-1 h-4 bg-slate-800 rounded"></div>
                                <div className="col-span-5 h-4 bg-slate-800 rounded w-3/4"></div>
                                <div className="col-span-3 h-6 bg-slate-800 rounded-full w-16"></div>
                                <div className="col-span-3 h-5 bg-slate-800 rounded w-12 ml-auto"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results List */}
                {!isLoading && (
                    <div className="divide-y divide-slate-800">
                        {sortedResults.map((result, idx) => {
                            const { candidateName, matchScore } = result.analysis_json;
                            const isCached = result.is_cached;

                            return (
                                <div key={idx} className="bg-slate-900/30 transition-colors hover:bg-slate-800/30 group">
                                    <div
                                        className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
                                        onClick={() => setSelectedCandidate(result)}
                                    >
                                        <div className="col-span-1 text-center font-mono text-slate-500 text-sm">
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
                )}

                {!isLoading && results.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <p>No matches yet. Upload resumes to see rankings.</p>
                    </div>
                )}
            </div>

            {/* Deep Dive Modal */}
            <CandidateDeepDive
                isOpen={!!selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                data={selectedCandidate?.analysis_json!}
            />
        </div>
    );
}
