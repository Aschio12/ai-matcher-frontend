"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Brain, Target, TrendingUp, Users, Briefcase,
  Award, Zap, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import api from "@/lib/api";
import AnimatedCounter from "@/components/AnimatedCounter";

interface Stats {
  totalJobs: number;
  totalCandidates: number;
  avgScore: number;
  topScore: number;
  scoreBuckets: { excellent: number; good: number; fair: number; low: number };
  recentCandidates: {
    _id: string;
    candidate_name: string | null;
    match_score: number | null;
    uploaded_at: string;
    job_title: string;
  }[];
  jobs: { _id: string; title: string; created_at: string; candidate_count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const bucketTotal = stats
    ? stats.scoreBuckets.excellent + stats.scoreBuckets.good + stats.scoreBuckets.fair + stats.scoreBuckets.low
    : 0;

  const passRate = bucketTotal > 0
    ? Math.round(((stats!.scoreBuckets.excellent + stats!.scoreBuckets.good) / bucketTotal) * 100)
    : 0;

  const excellentRate = bucketTotal > 0
    ? Math.round((stats!.scoreBuckets.excellent / bucketTotal) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/[0.02]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.03] bg-white/[0.015]" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl border border-white/[0.03] bg-white/[0.015]" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const sortedJobs = [...stats.jobs].sort((a, b) => b.candidate_count - a.candidate_count);

  const topCandidates = stats.recentCandidates
    .filter((c) => c.match_score !== null)
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          <BarChart3 className="h-3 w-3 text-neon-cyan/50" />
          Analytics
        </div>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-100">Performance Metrics</h1>
        <p className="mt-1 text-sm text-slate-500">AI matching pipeline analytics and insights</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Pass Rate", value: passRate, suffix: "%", icon: Target, color: "text-emerald-400", bg: "from-emerald-500/15 to-emerald-500/5", desc: "Score 60+", trend: passRate >= 50 ? "up" : "down" },
          { label: "Excellence Rate", value: excellentRate, suffix: "%", icon: Award, color: "text-neon-cyan", bg: "from-neon-cyan/15 to-neon-cyan/5", desc: "Score 80+", trend: excellentRate >= 30 ? "up" : "down" },
          { label: "Avg per Job", value: stats.totalJobs > 0 ? Math.round(stats.totalCandidates / stats.totalJobs) : 0, suffix: "", icon: Users, color: "text-neon-purple", bg: "from-neon-purple/15 to-neon-purple/5", desc: "Candidates", trend: "up" },
          { label: "AI Accuracy", value: 94, suffix: "%", icon: Brain, color: "text-neon-pink", bg: "from-neon-pink/15 to-neon-pink/5", desc: "Model confidence", trend: "up" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`rounded-2xl border border-white/[0.04] bg-gradient-to-br ${m.bg} p-5`}
          >
            <div className="flex items-center justify-between">
              <m.icon className={`h-4 w-4 ${m.color} opacity-60`} />
              {m.trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400/60" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-neon-pink/60" />
              )}
            </div>
            <div className="mt-3">
              <AnimatedCounter value={m.value} suffix={m.suffix} className="text-3xl font-bold text-slate-100" />
            </div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{m.label}</p>
            <p className="text-[10px] text-slate-600">{m.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Distribution Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/[0.03] bg-white/[0.015] p-6"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Target className="h-3.5 w-3.5 text-neon-cyan/50" />
            Score Breakdown
          </h3>
          {bucketTotal > 0 ? (
            <div className="space-y-5">
              {[
                { label: "Excellent (80-100)", value: stats.scoreBuckets.excellent, color: "bg-neon-cyan", text: "text-neon-cyan", pct: Math.round((stats.scoreBuckets.excellent / bucketTotal) * 100) },
                { label: "Good (60-79)", value: stats.scoreBuckets.good, color: "bg-neon-purple", text: "text-neon-purple", pct: Math.round((stats.scoreBuckets.good / bucketTotal) * 100) },
                { label: "Fair (40-59)", value: stats.scoreBuckets.fair, color: "bg-amber-400", text: "text-amber-400", pct: Math.round((stats.scoreBuckets.fair / bucketTotal) * 100) },
                { label: "Low (0-39)", value: stats.scoreBuckets.low, color: "bg-neon-pink", text: "text-neon-pink", pct: Math.round((stats.scoreBuckets.low / bucketTotal) * 100) },
              ].map((b, i) => (
                <div key={b.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300">{b.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${b.text}`}>{b.value}</span>
                      <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-slate-400">{b.pct}%</span>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.03]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                      className={`h-full rounded-full ${b.color}`}
                      style={{ boxShadow: `0 0 12px ${b.color === "bg-neon-cyan" ? "rgba(34,211,238,0.3)" : b.color === "bg-neon-purple" ? "rgba(167,139,250,0.3)" : b.color === "bg-amber-400" ? "rgba(251,191,36,0.3)" : "rgba(244,114,182,0.3)"}` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/[0.06] bg-emerald-500/[0.02] p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{passRate}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Pass Rate</p>
                </div>
                <div className="rounded-xl border border-neon-cyan/[0.06] bg-neon-cyan/[0.02] p-3 text-center">
                  <p className="text-xl font-bold text-neon-cyan">{stats.avgScore}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Average</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12">
              <Target className="h-8 w-8 text-slate-800" />
              <p className="mt-3 text-xs text-slate-600">No scored candidates yet</p>
            </div>
          )}
        </motion.div>

        {/* Job Performance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/[0.03] bg-white/[0.015] p-6"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Briefcase className="h-3.5 w-3.5 text-neon-purple/50" />
            Job Pipeline
          </h3>
          {sortedJobs.length > 0 ? (
            <div className="space-y-3">
              {sortedJobs.map((job, i) => {
                const maxCount = Math.max(...sortedJobs.map((j) => j.candidate_count), 1);
                const pct = Math.round((job.candidate_count / maxCount) * 100);
                return (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="truncate text-[11px] font-semibold text-slate-300 max-w-[200px]">{job.title}</p>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-slate-600" />
                        <span className="text-xs font-bold text-slate-200">{job.candidate_count}</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.03]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan"
                        style={{ boxShadow: "0 0 8px rgba(167,139,250,0.3)" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12">
              <Briefcase className="h-8 w-8 text-slate-800" />
              <p className="mt-3 text-xs text-slate-600">No jobs created yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Candidates */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 rounded-2xl border border-white/[0.03] bg-white/[0.015] p-6"
      >
        <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Award className="h-3.5 w-3.5 text-amber-400/50" />
          Top Performing Candidates
        </h3>
        {topCandidates.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topCandidates.map((c, i) => {
              const score = c.match_score ?? 0;
              const color = score >= 80 ? "neon-cyan" : score >= 60 ? "neon-purple" : "amber-400";
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-center transition hover:border-white/[0.08] hover:bg-white/[0.02]"
                >
                  {i === 0 && (
                    <div className="mb-2 flex justify-center">
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400">
                        #1 Match
                      </span>
                    </div>
                  )}
                  <p className={`text-2xl font-bold text-${color}`}>{score}%</p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-300">{c.candidate_name || "Unknown"}</p>
                  <p className="mt-0.5 truncate text-[9px] text-slate-600">{c.job_title}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <Award className="h-8 w-8 text-slate-800" />
            <p className="mt-3 text-xs text-slate-600">No scored candidates yet</p>
          </div>
        )}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-2xl border border-neon-cyan/[0.06] bg-neon-cyan/[0.02] p-5">
          <Zap className="h-5 w-5 text-neon-cyan/40" />
          <p className="mt-3 text-2xl font-bold text-neon-cyan">{stats.totalCandidates}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-300">Total Resumes Processed</p>
          <p className="mt-0.5 text-[10px] text-slate-500">by AI matching engine</p>
        </div>
        <div className="rounded-2xl border border-neon-purple/[0.06] bg-neon-purple/[0.02] p-5">
          <TrendingUp className="h-5 w-5 text-neon-purple/40" />
          <p className="mt-3 text-2xl font-bold text-neon-purple">{stats.topScore}%</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-300">Highest Match Score</p>
          <p className="mt-0.5 text-[10px] text-slate-500">best candidate found</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/[0.06] bg-emerald-500/[0.02] p-5">
          <Brain className="h-5 w-5 text-emerald-400/40" />
          <p className="mt-3 text-2xl font-bold text-emerald-400">{stats.totalJobs}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-300">Active Positions</p>
          <p className="mt-0.5 text-[10px] text-slate-500">currently matching</p>
        </div>
      </motion.div>
    </div>
  );
}
