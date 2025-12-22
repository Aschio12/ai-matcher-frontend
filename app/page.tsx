"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Target, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center space-y-8 mb-20 animate-fade-in-up">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400">
                        AI Recruitment Intelligence
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Transform your hiring process. Instantly parse resumes, visualize skill gaps, and generate tailored interview questions with 100% deterministic AI.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    {user?.token ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-[var(--background)] text-lg font-bold rounded-full hover:opacity-90 transition-opacity shadow-xl"
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--foreground)] text-[var(--background)] text-lg font-bold rounded-full hover:opacity-90 transition-opacity shadow-xl"
                            >
                                Get Started <ArrowRight className="w-5 h-5" />
                            </Link>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Feature Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                <FeatureCard
                    icon={<Zap className="w-8 h-8 text-amber-500" />}
                    title="Smart Extraction"
                    description="Parses messy PDFs instantly. Extracts names, skills, and experience with human-level accuracy."
                    delay={0.4}
                />
                <FeatureCard
                    icon={<Target className="w-8 h-8 text-cyan-500" />}
                    title="Skill Mapping"
                    description="Visualizes candidates against your job description. See exactly what is Found, Missing, or Partial."
                    delay={0.5}
                />
                <FeatureCard
                    icon={<FileText className="w-8 h-8 text-purple-500" />}
                    title="Interview Prep"
                    description="Don't just filter—engage. The AI generates specific questions to probe each candidate's weaknesses."
                    delay={0.6}
                />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="mb-4 bg-[var(--background)] w-16 h-16 rounded-xl flex items-center justify-center border border-[var(--border)]">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}
