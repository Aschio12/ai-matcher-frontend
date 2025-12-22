"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, Briefcase } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import MultiFileUpload from './MultiFileUpload';
import MatchLeaderboard from './MatchLeaderboard';

type Job = {
    id: string;
    title: string;
    description_text: string;
    created_at: string;
};

export default function JobMatchList() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);

    // UI State
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isMatching, setIsMatching] = useState(false);

    // Results State
    const [matchResults, setMatchResults] = useState<Record<string, any[]>>({});

    // Fetch Jobs
    useEffect(() => {
        if (!user?.token) return;
        const fetchJobs = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/v1/jobs', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data.jobs);
                }
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            }
        };
        fetchJobs();
    }, [user]);

    const handleBulkMatch = async (files: File[]) => {
        if (!selectedJobId || !user?.token) return;

        setIsMatching(true);
        const formData = new FormData();
        formData.append('job_id', selectedJobId);
        files.forEach(f => formData.append('resumes', f));

        try {
            const res = await fetch('http://localhost:3001/api/v1/match', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setMatchResults(prev => ({
                    ...prev,
                    [selectedJobId]: data.results
                }));
            }
        } catch (error) {
            console.error("Match error", error);
        } finally {
            setIsMatching(false);
        }
    };

    // Derived state for current view
    const activeJob = jobs.find(j => j.id === selectedJobId);
    const activeResults = selectedJobId ? matchResults[selectedJobId] : null;

    if (selectedJobId && activeJob) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedJobId(null)}
                    className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{activeJob.title}</h2>
                    <p className="text-slate-400 text-sm mb-6">{activeJob.description_text}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Upload Area */}
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" /> Add Candidates
                            </h3>
                            <MultiFileUpload onUpload={handleBulkMatch} isLoading={isMatching} />
                        </div>

                        {/* Right: Leaderboard */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5" /> Top Matches
                            </h3>
                            {activeResults ? (
                                <MatchLeaderboard results={activeResults} />
                            ) : (
                                <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/50 text-slate-500">
                                    Upload resumes to see rankings
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
                <motion.div
                    key={job.id}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-colors group"
                    onClick={() => setSelectedJobId(job.id)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        {matchResults[job.id] && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                {matchResults[job.id].length} Matches
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                        {job.description_text}
                    </p>
                    <div className="text-sm font-medium text-cyan-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage Candidates <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
