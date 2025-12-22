"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertTriangle, HelpCircle, FileText, Zap } from 'lucide-react';

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
    if (!isOpen) return null;

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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-900/95 border-b border-slate-800 p-6 flex justify-between items-start z-10 backdrop-blur-md">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                {data.candidateName}
                                <span className={`text-sm px-3 py-1 rounded-full border 
                                    ${data.matchScore >= 75 ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                        data.matchScore >= 50 ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                            'text-red-400 border-red-500/30 bg-red-500/10'}`}>
                                    {data.matchScore}% Match
                                </span>
                            </h2>
                            <p className="text-slate-400 mt-1 italic">"{data.justification}"</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownload}
                                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors"
                                title="Download Report"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* 1. Skill Matrix */}
                        <section>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Skill Gap Matrix
                            </h3>
                            {hasIntelligence ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data.skill_gap_analysis?.map((item, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border 
                                            ${item.status === 'found' ? 'bg-green-500/5 border-green-500/20' :
                                                item.status === 'missing' ? 'bg-red-500/5 border-red-500/20' :
                                                    'bg-yellow-500/5 border-yellow-500/20'}`}>

                                            {item.status === 'found' && <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />}
                                            {item.status === 'missing' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
                                            {item.status === 'partial' && <HelpCircle className="w-5 h-5 text-yellow-400 shrink-0" />}

                                            <div>
                                                <p className="text-sm font-medium text-slate-200">{item.skill}</p>
                                                <p className="text-xs uppercase font-bold tracking-wider opacity-70 
                                                    ${item.status === 'found' ? 'text-green-400' : item.status === 'missing' ? 'text-red-400' : 'text-yellow-400'}">
                                                    {item.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <LegacyFallback onReAnalyze={onReAnalyze} />
                            )}
                        </section>

                        {/* 2. AI Interviewer */}
                        <section>
                            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> AI Interview Questions
                            </h3>
                            {hasIntelligence ? (
                                <div className="space-y-4">
                                    {data.interview_questions?.map((question, idx) => (
                                        <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-colors">
                                            <span className="text-purple-500 font-mono text-sm mb-2 block">Question {idx + 1}</span>
                                            <p className="text-slate-200 text-lg">{question}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 italic p-4 border border-dashed border-slate-800 rounded-xl">
                                    Questions not available for this legacy record.
                                </div>
                            )}
                        </section>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function LegacyFallback({ onReAnalyze }: { onReAnalyze?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
            <p className="text-slate-300 font-medium">Intelligence data not available</p>
            <p className="text-slate-500 text-sm mb-4">This record was created before the AI upgrade.</p>
            {onReAnalyze && (
                <button
                    onClick={onReAnalyze}
                    className="px-4 py-2 bg-slate-700 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors"
                >
                    Re-analyze Candidate
                </button>
            )}
        </div>
    );
}
