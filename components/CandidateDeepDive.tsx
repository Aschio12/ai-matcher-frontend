"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertTriangle, HelpCircle, FileText, Zap } from 'lucide-react';
import ProgressRing from './ProgressRing';

type AnalysisData = {
    candidateName: string;
    matchScore: number;
    justification: string;
    key_matches: string[];
    missing_requirements: string[];
    interview_questions?: string[];
    skill_gap_analysis?: { skill: string; status: 'found' | 'missing' | 'partial' }[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    data: AnalysisData;
    onReAnalyze?: () => void;
};

export default function CandidateDeepDive({ isOpen, onClose, data, onReAnalyze }: Props) {
    if (!data) return null;

    const hasIntelligence = !!data.interview_questions && !!data.skill_gap_analysis;

    const handleDownload = () => {
        const textContent = `
Recruiting Intelligence Report
------------------------------
Candidate: ${data.candidateName}
Match Score: ${data.matchScore}%
Summary: ${data.justification}

Skill Gap Analysis:
${data.skill_gap_analysis?.map(s => `- [${s.status.toUpperCase()}] ${s.skill}`).join('\n') || 'N/A'}

Suggested Interview Questions:
${data.interview_questions?.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'N/A'}
        `;

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.candidateName.replace(/\s+/g, '_')}_Report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dimmed Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Slide-Over Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[var(--background)] border-l border-[var(--border)] shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--background)]/95 border-b border-[var(--border)] p-8 flex justify-between items-start z-10 backdrop-blur-md">
                            <div className="pr-12">
                                <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                    {data.candidateName}
                                </h2>
                                <p className="text-slate-500 text-lg leading-relaxed">"{data.justification}"</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Score Section */}
                            <div className="flex items-center gap-8 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                                <ProgressRing score={data.matchScore} size={100} />
                                <div>
                                    <h3 className="text-xl font-bold mb-1">AI Match Score</h3>
                                    <p className="text-slate-500 text-sm">Based on strict job description comparison.</p>
                                    <button
                                        onClick={handleDownload}
                                        className="mt-3 flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                                    >
                                        <Download className="w-4 h-4" /> Download Report
                                    </button>
                                </div>
                            </div>

                            {/* 1. Skill Matrix */}
                            <section>
                                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" /> Skill Analysis
                                </h3>
                                {hasIntelligence ? (
                                    <div className="flex flex-col gap-3">
                                        {data.skill_gap_analysis?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                                                <span className="font-medium text-lg">{item.skill}</span>

                                                {item.status === 'found' && (
                                                    <span className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                                                        <CheckCircle className="w-4 h-4" /> FOUND
                                                    </span>
                                                )}
                                                {item.status === 'missing' && (
                                                    <span className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full text-sm font-bold">
                                                        <AlertTriangle className="w-4 h-4" /> MISSING
                                                    </span>
                                                )}
                                                {item.status === 'partial' && (
                                                    <span className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-bold">
                                                        <HelpCircle className="w-4 h-4" /> PARTIAL
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <LegacyFallback onReAnalyze={onReAnalyze} />
                                )}
                            </section>

                            {/* 2. AI Interviewer */}
                            <section>
                                <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-500" /> Interview Guide
                                </h3>
                                {hasIntelligence ? (
                                    <div className="space-y-4">
                                        {data.interview_questions?.map((question, idx) => (
                                            <div key={idx} className="p-6 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-purple-500/30 transition-all">
                                                <div className="flex gap-4">
                                                    <span className="px-3 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold rounded-lg text-sm">
                                                        Q{idx + 1}
                                                    </span>
                                                    <p className="text-lg leading-relaxed">{question}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 italic p-4 border border-dashed border-slate-700 rounded-xl">
                                        Questions not available for this legacy record.
                                    </div>
                                )}
                            </section>

                            <div className="h-20"></div> {/* Bottom Spacer */}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function LegacyFallback({ onReAnalyze }: { onReAnalyze?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-[var(--card)] rounded-xl border border-dashed border-[var(--border)] text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
            <p className="font-medium">Intelligence data not available</p>
            <p className="text-slate-500 text-sm mb-4">This record was created before the AI upgrade.</p>
        </div>
    );
}
