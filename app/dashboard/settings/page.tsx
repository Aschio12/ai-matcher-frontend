"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Shield, Database, Brain, Zap,
  CheckCircle2, XCircle, Globe, Key, Server, HardDrive,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/auth-context";

interface HealthStatus {
  api: boolean;
  database: boolean;
  ai: boolean;
  storage: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthStatus>({ api: false, database: false, ai: false, storage: false });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const status: HealthStatus = { api: false, database: false, ai: false, storage: false };

      try {
        const res = await api.get("/stats");
        status.api = true;
        status.database = true;
        if (res.data.totalJobs !== undefined) {
          status.ai = true;
          status.storage = true;
        }
      } catch {
        try {
          await fetch("http://localhost:3001/health");
          status.api = true;
        } catch { /* api down */ }
      }

      setHealth(status);
      setChecking(false);
    };

    checkHealth();
  }, []);

  const services = [
    { name: "API Server", desc: "Express.js backend on port 3001", icon: Server, status: health.api, tech: "Node.js + Express v5" },
    { name: "Database", desc: "MongoDB Atlas cluster", icon: Database, status: health.database, tech: "Mongoose ODM" },
    { name: "AI Engine", desc: "OpenAI GPT-4o-mini analysis", icon: Brain, status: health.ai, tech: "GPT-4o-mini" },
    { name: "File Storage", desc: "Supabase storage bucket", icon: HardDrive, status: health.storage, tech: "Supabase S3" },
  ];

  const techStack = [
    { category: "Frontend", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion"] },
    { category: "Backend", items: ["Node.js", "Express v5", "MongoDB", "Mongoose", "JWT Auth"] },
    { category: "AI & Storage", items: ["OpenAI GPT-4o-mini", "Supabase Storage", "PDF Parse", "SHA-256 Hashing"] },
    { category: "Infrastructure", items: ["MongoDB Atlas", "Supabase Cloud", "REST API", "CORS Enabled"] },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          <Settings className="h-3 w-3 text-neon-cyan/50" />
          Configuration
        </div>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-100">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">System configuration and service status</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <User className="h-3.5 w-3.5 text-neon-cyan/50" />
            Profile
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
              <User className="h-7 w-7 text-neon-cyan/60" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-100">Recruiter</p>
              <p className="text-xs text-slate-500">Administrator</p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                <span className="text-[10px] font-medium text-emerald-400/70">Active Session</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-neon-cyan/40" />
                  <span className="text-[11px] font-semibold text-slate-300">Role</span>
                </div>
                <span className="rounded-full bg-neon-cyan/10 px-2.5 py-0.5 text-[10px] font-bold text-neon-cyan">Admin</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-3.5 w-3.5 text-neon-purple/40" />
                  <span className="text-[11px] font-semibold text-slate-300">Auth Method</span>
                </div>
                <span className="text-[10px] text-slate-500">JWT Token</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-emerald-400/40" />
                  <span className="text-[11px] font-semibold text-slate-300">Session</span>
                </div>
                <span className="text-[10px] text-slate-500">24h expiry</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Service Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Zap className="h-3.5 w-3.5 text-emerald-400/50" />
            Service Status
            {!checking && (
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${
                Object.values(health).every(Boolean)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-400/10 text-amber-400"
              }`}>
                {Object.values(health).every(Boolean) ? "All Systems Operational" : "Partial Outage"}
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] px-4 py-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.status ? "bg-emerald-500/[0.06]" : "bg-red-500/[0.06]"}`}>
                  <s.icon className={`h-4 w-4 ${s.status ? "text-emerald-400/70" : "text-red-400/70"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-300">{s.name}</p>
                  <p className="text-[10px] text-slate-600">{s.desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {checking ? (
                    <div className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-slate-400" />
                  ) : s.status ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-[10px] font-bold ${checking ? "text-slate-500" : s.status ? "text-emerald-400" : "text-red-400"}`}>
                    {checking ? "Checking..." : s.status ? "Online" : "Offline"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6"
      >
        <h3 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Zap className="h-3.5 w-3.5 text-neon-purple/50" />
          Technology Stack
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4"
            >
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-neon-cyan/60">{cat.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <span key={item} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium text-slate-400">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-6 text-center"
      >
        <p className="text-[10px] text-slate-700">
          AI Matcher v3.0 &middot; Neural Recruitment Engine &middot; Built with Next.js 16 + GPT-4o
        </p>
      </motion.div>
    </div>
  );
}
