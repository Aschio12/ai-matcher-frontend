"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Upload, FileText, User, CheckCircle2, AlertTriangle,
  Loader2, ChevronDown, ChevronUp, Sparkles, Zap, Clock, Trash2, Brain,
  Target, Award, TrendingUp, Users, CloudUpload, X, Info,
} from "lucide-react";
import api from "@/lib/api";
import ScoreRing from "@/components/ScoreRing";

type ClientHint = {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  code?: string;
};

const PHASE_STEPS = [
  { label: "Step 1 of 3", detail: "Sending your file to the server…" },
  { label: "Step 2 of 3", detail: "Saving to storage and extracting text from your CV…" },
  { label: "Step 3 of 3", detail: "Calling OpenAI to score the match (often 15–45 seconds)…" },
];

function mergeHints(hints: ClientHint[]): ClientHint | null {
  if (hints.length === 0) return null;
  const rank: Record<ClientHint["type"], number> = { error: 0, warning: 1, info: 2, success: 3 };
  return [...hints].sort((a, b) => rank[a.type] - rank[b.type])[0];
}

interface Job { _id: string; title: string; description_text: string; created_at: string }
interface Candidate {
  _id: string; candidate_name: string | null; resume_file_url: string;
  match_score: number | null;
  ai_report_json: { summary?: string; strengths?: string[]; gaps?: string[]; raw_analysis?: string; match_score?: number } | null;
  uploaded_at: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFileLabel, setUploadFileLabel] = useState("");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [activeHint, setActiveHint] = useState<ClientHint | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [jobRes, candRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/candidates/job/${jobId}`),
      ]);
      setJob(jobRes.data.job);
      setCandidates(candRes.data.candidates || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [jobId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!uploading) {
      setPhaseIndex(0);
      return;
    }
    const id = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % PHASE_STEPS.length);
    }, 3200);
    return () => clearInterval(id);
  }, [uploading]);

  useEffect(() => {
    if (activeHint?.type !== "success") return;
    const t = setTimeout(() => setActiveHint(null), 12000);
    return () => clearTimeout(t);
  }, [activeHint]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setActiveHint(null);
    setUploading(true);
    const total = files.length;
    const collected: ClientHint[] = [];
    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadFileLabel(`${file.name}${total > 1 ? ` (${i + 1}/${total})` : ""}`);
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jobId", jobId);
        formData.append("candidate_name", file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
        const { data } = await api.post("/candidates", formData, { headers: { "Content-Type": "multipart/form-data" } });
        if (data?.clientHint) collected.push(data.clientHint as ClientHint);
      }
      await fetchData();
      const merged = mergeHints(collected);
      if (merged) setActiveHint(merged);
    } catch (err: any) {
      const d = err?.response?.data;
      if (d?.clientHint) setActiveHint(d.clientHint as ClientHint);
      else {
        setActiveHint({
          type: "error",
          title: "Upload failed",
          message: d?.message || err?.message || "Could not reach the server. Is the backend running on port 3001?",
          code: "NETWORK",
        });
      }
    } finally {
      setUploading(false);
      setUploadFileLabel("");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await api.delete(`/candidates/${id}`); setCandidates((p) => p.filter((c) => c._id !== id)); }
    catch (err) { console.error(err); }
    finally { setDeletingId(null); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); };

  const getScoreStyle = (s: number) => {
    if (s >= 80) return { text: "Excellent", color: "text-neon-cyan", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" };
    if (s >= 60) return { text: "Good", color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/20" };
    if (s >= 40) return { text: "Fair", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
    return { text: "Low", color: "text-neon-pink", bg: "bg-neon-pink/10", border: "border-neon-pink/20" };
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan" />
          <Brain className="absolute inset-0 m-auto h-4 w-4 text-neon-cyan/40" />
        </div>
        <p className="text-[10px] font-medium text-slate-600">Loading position data...</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <Target className="h-10 w-10 text-slate-800" />
      <p className="text-sm text-slate-400">Position not found</p>
      <button onClick={() => router.push("/dashboard/jobs")} className="text-xs text-neon-cyan hover:underline">Back to jobs</button>
    </div>
  );

  const sorted = [...candidates].sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1));
  const scored = candidates.filter((c) => c.match_score !== null);
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.match_score ?? 0), 0) / scored.length) : null;
  const topScore = scored.length > 0 ? Math.max(...scored.map((c) => c.match_score ?? 0)) : null;

  return (
    <div>
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/dashboard/jobs")}
        className="mb-6 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition hover:text-neon-cyan"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Jobs
      </motion.button>

      {/* Job Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                <Zap className="h-3 w-3 text-neon-cyan/50" /> Position
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-100">{job.title}</h1>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex gap-3">
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-100">{candidates.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Total</p>
              </div>
              {avgScore !== null && (
                <div className="rounded-xl border border-neon-cyan/[0.08] bg-neon-cyan/[0.02] px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-neon-cyan">{avgScore}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Avg Score</p>
                </div>
              )}
              {topScore !== null && (
                <div className="rounded-xl border border-emerald-500/[0.08] bg-emerald-500/[0.02] px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{topScore}%</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Top Score</p>
                </div>
              )}
            </div>
          </div>

          <details className="mt-5">
            <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:text-slate-400">
              View Full Description
            </summary>
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 text-xs leading-relaxed text-slate-400">
              {job.description_text}
            </p>
          </details>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-200">
          <Upload className="h-3.5 w-3.5 text-neon-cyan" /> Upload Resumes
        </h2>

        <AnimatePresence>
          {activeHint && !uploading && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`relative mb-4 rounded-2xl border px-4 py-3 pr-10 ${
                activeHint.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                  : activeHint.type === "error"
                    ? "border-red-500/25 bg-red-500/[0.06]"
                    : activeHint.type === "warning"
                      ? "border-amber-500/25 bg-amber-500/[0.06]"
                      : "border-neon-cyan/15 bg-neon-cyan/[0.04]"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveHint(null)}
                className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex gap-3">
                {activeHint.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />}
                {activeHint.type === "error" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                {activeHint.type === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />}
                {activeHint.type === "info" && <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />}
                <div>
                  <p className={`text-sm font-bold ${
                    activeHint.type === "success" ? "text-emerald-200" :
                    activeHint.type === "error" ? "text-red-200" :
                    activeHint.type === "warning" ? "text-amber-200" : "text-neon-cyan/90"
                  }`}>{activeHint.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{activeHint.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden rounded-2xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/[0.08] to-neon-purple/[0.05] p-5 shadow-[0_0_40px_rgba(34,211,238,0.06)]"
            >
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neon-cyan/10">
                  <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
                  <Brain className="pointer-events-none absolute h-3.5 w-3.5 text-neon-cyan/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neon-cyan">Working on your CV…</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">{uploadFileLabel}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{PHASE_STEPS[phaseIndex].label}</p>
                  <p className="mt-1 text-xs text-slate-300">{PHASE_STEPS[phaseIndex].detail}</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full w-1/3 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                  animate={{ x: ["-120%", "280%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="mt-3 text-[10px] text-slate-600">Do not close this tab until the process finishes.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 transition-all ${
            dragOver ? "border-neon-cyan/30 bg-neon-cyan/[0.03] shadow-[0_0_40px_rgba(34,211,238,0.06)]" : "border-white/[0.04] bg-white/[0.008] hover:border-white/[0.08] hover:bg-white/[0.015]"
          } ${uploading ? "pointer-events-none opacity-40" : ""}`}
        >
          <input type="file" accept=".txt,.pdf,.doc,.docx" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
            <CloudUpload className="h-6 w-6 text-neon-cyan/50" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-300">
            Drop resumes here or <span className="font-bold text-neon-cyan">browse files</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-600">PDF, TXT, DOC, DOCX &middot; Max 10MB per file</p>
        </label>
      </motion.div>

      {/* Candidates */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Sparkles className="h-4 w-4 text-neon-purple/50" /> Candidates
            {candidates.length > 0 && (
              <span className="rounded-full bg-neon-purple/10 px-2.5 py-0.5 text-[10px] font-bold text-neon-purple">
                {candidates.length}
              </span>
            )}
          </h2>
          {scored.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <TrendingUp className="h-3 w-3" />
              Sorted by match score
            </div>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.01] py-16">
            <User className="h-10 w-10 text-slate-800" />
            <p className="mt-3 text-sm text-slate-400">No candidates yet</p>
            <p className="mt-1 text-xs text-slate-600">Upload resumes above to start AI analysis</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((c, i) => {
              const expanded = expandedId === c._id;
              const report = c.ai_report_json;
              const style = c.match_score !== null ? getScoreStyle(c.match_score) : null;

              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`overflow-hidden rounded-2xl border bg-white/[0.015] transition-all ${
                    expanded ? "border-white/[0.08] bg-white/[0.025]" : "border-white/[0.04] hover:border-white/[0.06]"
                  }`}
                >
                  {/* Header row */}
                  <div onClick={() => setExpandedId(expanded ? null : c._id)} className="flex w-full cursor-pointer items-center gap-4 p-5 text-left">
                    <ScoreRing score={c.match_score} size={56} strokeWidth={4} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-200">{c.candidate_name || "Unknown Candidate"}</p>
                        {style && (
                          <span className={`rounded-lg ${style.bg} border ${style.border} px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style.color}`}>
                            {style.text}
                          </span>
                        )}
                        {i === 0 && c.match_score !== null && (
                          <span className="flex items-center gap-1 rounded-lg bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                            <Award className="h-2.5 w-2.5" /> Top Match
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{report?.summary || "No analysis available"}</p>
                      <p className="mt-1 text-[10px] text-slate-700">
                        {new Date(c.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                        disabled={deletingId === c._id}
                        className="rounded-lg p-2 text-slate-700 transition hover:bg-red-500/[0.06] hover:text-red-400"
                      >
                        {deletingId === c._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                      {expanded ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
                    </div>
                  </div>

                  {/* Expanded report */}
                  <AnimatePresence>
                    {expanded && report && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.04] px-5 pb-5 pt-4">
                          {report.raw_analysis ? (
                            <div className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4">
                              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{report.raw_analysis}</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Summary */}
                              {report.summary && (
                                <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <Brain className="h-3 w-3 text-neon-cyan/50" /> AI Summary
                                  </p>
                                  <p className="text-xs leading-relaxed text-slate-300">{report.summary}</p>
                                </div>
                              )}

                              <div className="grid gap-4 md:grid-cols-2">
                                {/* Strengths */}
                                {report.strengths && report.strengths.length > 0 && (
                                  <div className="rounded-xl border border-emerald-500/[0.08] bg-emerald-500/[0.02] p-4">
                                    <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                      <CheckCircle2 className="h-3 w-3" /> Strengths ({report.strengths.length})
                                    </p>
                                    <ul className="space-y-2">
                                      {report.strengths.map((s, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
                                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/60" />{s}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Gaps */}
                                {report.gaps && report.gaps.length > 0 && (
                                  <div className="rounded-xl border border-neon-pink/[0.08] bg-neon-pink/[0.02] p-4">
                                    <p className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neon-pink">
                                      <AlertTriangle className="h-3 w-3" /> Gaps ({report.gaps.length})
                                    </p>
                                    <ul className="space-y-2">
                                      {report.gaps.map((g, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
                                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-pink/60" />{g}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {c.resume_file_url && (
                            <a
                              href={c.resume_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neon-cyan/[0.06] px-3 py-1.5 text-[10px] font-bold text-neon-cyan transition hover:bg-neon-cyan/10"
                            >
                              <FileText className="h-3 w-3" /> View Original Resume
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
