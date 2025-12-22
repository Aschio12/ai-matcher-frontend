"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, Briefcase, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import MultiFileUpload from './MultiFileUpload';
import MatchLeaderboard from './MatchLeaderboard';
import JobCreationForm from './JobCreationForm';

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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    // Results State
    const [matchResults, setMatchResults] = useState<Record<string, any[]>>({});

    // Fetch Jobs
    const fetchJobs = useCallback(async () => {
        if (!user?.token) return;
        setIsLoadingJobs(true);
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
        } finally {
            setIsLoadingJobs(false);
        }
    }, [user]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

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
                    <p className="text-slate-400 text-sm mb-6 whitespace-pre-line max-h-40 overflow-y-auto custom-scrollbar">
                        {activeJob.description_text}
                    </p>

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
                            <MatchLeaderboard results={activeResults || []} isLoading={isMatching} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div>
                    <h2 className="text-xl font-bold text-white">Your Job Openings</h2>
                    <p className="text-sm text-slate-400">Select a job to find the perfect candidate</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Job
                </button>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card (Empty State or Action) */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 p-6 rounded-xl flex flex-col items-center justify-center text-center group min-h-[200px]"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors mb-4">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 group-hover:text-white">Create New Job</h3>
                    <p className="text-sm text-slate-500 mt-2">Add a title and description to start matching.</p>
                </motion.div>

                {/* Loading State */}
                {isLoadingJobs && jobs.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center p-12 text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading jobs...
                    </div>
                )}

                {/* Job Cards */}
                {jobs.map((job) => (
                    <motion.div
                        key={job.id}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-colors group relative overflow-hidden"
                        onClick={() => setSelectedJobId(job.id)}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 group-hover:bg-cyan-500/10"></div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-cyan-900/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            {matchResults[job.id] && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                    {matchResults[job.id].length} Matches
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 relative z-10">{job.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-3 mb-4 relative z-10">
                            {job.description_text}
                        </p>
                        <div className="text-sm font-medium text-cyan-500 flex items-center opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                            Manage Candidates <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Creation Modal */}
            <JobCreationForm
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onJobCreated={fetchJobs}
            />
        </div>
    );
}
