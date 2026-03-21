"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Brain,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Target,
  Award,
  Activity,
} from "lucide-react";
import api from "@/lib/api";
import ScoreRing from "@/components/ScoreRing";
import AnimatedCounter from "@/components/AnimatedCounter";
import GlowCard from "@/components/GlowCard";

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

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Active Jobs",
          value: stats.totalJobs,
          icon: Briefcase,
          color: "from-neon-cyan/15 to-neon-cyan/5",
          accent: "text-neon-cyan",
          glow: "rgba(34,211,238,0.06)",
          desc: "Open positions",
        },
        {
          label: "Candidates",
          value: stats.totalCandidates,
          icon: Users,
          color: "from-neon-purple/15 to-neon-purple/5",
          accent: "text-neon-purple",
          glow: "rgba(167,139,250,0.06)",
          desc: "Resumes analyzed",
        },
        {
          label: "Avg Score",
          value: stats.avgScore,
          icon: Brain,
          color: "from-neon-pink/15 to-neon-pink/5",
          accent: "text-neon-pink",
          glow: "rgba(244,114,182,0.06)",
          desc: "AI match average",
          suffix: "%",
        },
        {
          label: "Top Score",
          value: stats.topScore,
          icon: TrendingUp,
          color: "from-emerald-500/15 to-emerald-500/5",
          accent: "text-emerald-400",
          glow: "rgba(52,211,153,0.06)",
          desc: "Best match found",
          suffix: "%",
        },
      ]
    : [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  const bucketTotal = stats
    ? stats.scoreBuckets.excellent + stats.scoreBuckets.good + stats.scoreBuckets.fair + stats.scoreBuckets.low
    : 0;

  const buckets = stats ? [
    { label: "Excellent", key: "excellent" as const, value: stats.scoreBuckets.excellent, color: "bg-neon-cyan", glow: "shadow-[0_0_8px_rgba(34,211,238,0.4)]", text: "text-neon-cyan", range: "80-100" },
    { label: "Good", key: "good" as const, value: stats.scoreBuckets.good, color: "bg-neon-purple", glow: "shadow-[0_0_8px_rgba(167,139,250,0.4)]", text: "text-neon-purple", range: "60-79" },
    { label: "Fair", key: "fair" as const, value: stats.scoreBuckets.fair, color: "bg-amber-400", glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]", text: "text-amber-400", range: "40-59" },
    { label: "Low", key: "low" as const, value: stats.scoreBuckets.low, color: "bg-neon-pink", glow: "shadow-[0_0_8px_rgba(244,114,182,0.4)]", text: "text-neon-pink", range: "0-39" },
  ] : [];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          <Sparkles className="h-3 w-3 text-neon-cyan/50" />
          Neural Dashboard
        </div>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-100">
          Command Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time overview of your AI-powered recruitment pipeline
        </p>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/[0.03] bg-white/[0.015]" />
          ))}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              variants={item}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br ${card.color} p-5 transition-all duration-300 hover:border-white/[0.08]`}
              style={{ boxShadow: `0 0 40px ${card.glow}` }}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] ${card.accent}`}>
                  <card.icon className="h-4 w-4" />
                </div>
                <div className={`h-1.5 w-1.5 rounded-full bg-current ${card.accent} animate-pulse opacity-40`} />
              </div>
              <div className="mt-4">
                <AnimatedCounter
                  value={card.value}
                  suffix={card.suffix || ""}
                  className="text-3xl font-bold text-slate-100"
                />
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{card.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-600">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/[0.03] bg-white/[0.015] p-6 lg:col-span-4"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Target className="h-3.5 w-3.5 text-neon-cyan/50" />
            Score Distribution
          </h3>
          {!loading && stats && bucketTotal > 0 ? (
            <div className="space-y-4">
              {buckets.map((b, i) => (
                <motion.div
                  key={b.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${b.color}`} />
                      <span className="text-[11px] font-semibold text-slate-300">{b.label}</span>
                      <span className="text-[9px] text-slate-600">({b.range})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${b.text}`}>{b.value}</span>
                      <span className="text-[9px] text-slate-600">
                        {Math.round((b.value / bucketTotal) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.03]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.value / bucketTotal) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                      className={`h-full rounded-full ${b.color} ${b.glow}`}
                    />
                  </div>
                </motion.div>
              ))}

              <div className="mt-4 rounded-xl border border-white/[0.03] bg-white/[0.01] p-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Total Scored</span>
                  <span className="font-bold text-slate-300">{bucketTotal}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Pass Rate (60+)</span>
                  <span className="font-bold text-emerald-400">
                    {Math.round(((stats.scoreBuckets.excellent + stats.scoreBuckets.good) / bucketTotal) * 100)}%
                  </span>
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/[0.03] bg-white/[0.015] p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Activity className="h-3.5 w-3.5 text-neon-purple/50" />
              Recent Activity
            </h3>
            {stats && stats.recentCandidates.length > 0 && (
              <span className="rounded-full bg-neon-purple/10 px-2 py-0.5 text-[9px] font-bold text-neon-purple">
                {stats.recentCandidates.length} recent
              </span>
            )}
          </div>
          {!loading && stats && stats.recentCandidates.length > 0 ? (
            <div className="space-y-2">
              {stats.recentCandidates.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.02] bg-white/[0.01] px-3 py-2.5 transition hover:border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <ScoreRing score={c.match_score} size={38} strokeWidth={3} showLabel={true} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-slate-300">
                      {c.candidate_name || "Unknown"}
                    </p>
                    <p className="truncate text-[10px] text-slate-600">{c.job_title}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[11px] font-bold ${
                      (c.match_score ?? 0) >= 80 ? "text-neon-cyan" :
                      (c.match_score ?? 0) >= 60 ? "text-neon-purple" :
                      (c.match_score ?? 0) >= 40 ? "text-amber-400" : "text-neon-pink"
                    }`}>
                      {c.match_score ?? "—"}%
                    </p>
                    <p className="text-[9px] text-slate-700">
                      {new Date(c.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12">
              <Clock className="h-8 w-8 text-slate-800" />
              <p className="mt-3 text-xs text-slate-600">No activity yet</p>
            </div>
          )}
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4 lg:col-span-3"
        >
          <div className="rounded-2xl border border-white/[0.03] bg-white/[0.015] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Award className="h-3.5 w-3.5 text-amber-400/50" />
              AI Insights
            </h3>
            {stats && stats.totalCandidates > 0 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-neon-cyan/[0.06] bg-neon-cyan/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan/60">Top Match Rate</p>
                  <p className="mt-1 text-2xl font-bold text-neon-cyan">
                    {Math.round((stats.scoreBuckets.excellent / (bucketTotal || 1)) * 100)}%
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">candidates score 80+</p>
                </div>
                <div className="rounded-xl border border-neon-purple/[0.06] bg-neon-purple/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neon-purple/60">Avg per Job</p>
                  <p className="mt-1 text-2xl font-bold text-neon-purple">
                    {stats.totalJobs > 0 ? Math.round(stats.totalCandidates / stats.totalJobs) : 0}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">candidates per position</p>
                </div>
                <div className="rounded-xl border border-emerald-500/[0.06] bg-emerald-500/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/60">Pipeline Health</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">
                    {stats.avgScore >= 60 ? "Strong" : stats.avgScore >= 40 ? "Fair" : "Weak"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">based on avg score {stats.avgScore}%</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Brain className="h-6 w-6 text-slate-800" />
                <p className="mt-2 text-[10px] text-slate-600">Upload resumes to see insights</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Jobs Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Briefcase className="h-4 w-4 text-neon-cyan/50" />
            Active Positions
          </h3>
          <button
            onClick={() => router.push("/dashboard/jobs")}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neon-cyan transition hover:text-neon-cyan/80"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.03] bg-white/[0.015]" />
            ))}
          </div>
        ) : stats && stats.jobs.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.jobs.slice(0, 6).map((job, i) => (
              <GlowCard key={job._id} delay={0.45 + i * 0.04} onClick={() => router.push(`/dashboard/jobs/${job._id}`)}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-200">{job.title}</p>
                      <p className="mt-1 text-[10px] text-slate-600">
                        {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-700 transition group-hover:text-neon-cyan" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-neon-cyan/[0.06] px-2 py-0.5">
                      <Users className="h-2.5 w-2.5 text-neon-cyan/60" />
                      <span className="text-[10px] font-bold text-neon-cyan/80">{job.candidate_count}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">
                      candidate{job.candidate_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.01] py-14">
            <Briefcase className="h-7 w-7 text-slate-700" />
            <p className="mt-3 text-xs text-slate-500">No jobs yet</p>
            <button
              onClick={() => router.push("/dashboard/jobs")}
              className="mt-4 rounded-xl bg-neon-cyan/10 px-5 py-2 text-[10px] font-bold text-neon-cyan transition hover:bg-neon-cyan/15"
            >
              Create First Job
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
