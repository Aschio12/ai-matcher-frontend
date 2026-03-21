"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Briefcase, Trash2, Pencil, X, ArrowRight, Search, Loader2,
  Users, Clock, Sparkles, LayoutGrid, List,
} from "lucide-react";
import api from "@/lib/api";

interface Job {
  _id: string;
  title: string;
  description_text: string;
  created_at: string;
  candidate_count?: number;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/stats");
      setJobs(res.data.jobs || []);
    } catch {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const openCreate = () => { setEditingJob(null); setTitle(""); setDescription(""); setShowModal(true); };
  const openEdit = (job: Job) => { setEditingJob(job); setTitle(job.title); setDescription(job.description_text); setShowModal(true); };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      if (editingJob) await api.put(`/jobs/${editingJob._id}`, { title, description_text: description });
      else await api.post("/jobs", { title, description_text: description });
      setShowModal(false);
      fetchJobs();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await api.delete(`/jobs/${id}`); setJobs((p) => p.filter((j) => j._id !== id)); }
    catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description_text.toLowerCase().includes(search.toLowerCase())
  );

  const totalCandidates = jobs.reduce((s, j) => s + (j.candidate_count || 0), 0);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
              <Briefcase className="h-3 w-3 text-neon-cyan/50" />
              Job Management
            </div>
            <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-100">Job Descriptions</h1>
            <p className="mt-1 text-sm text-slate-500">
              {jobs.length} position{jobs.length !== 1 ? "s" : ""} &middot; {totalCandidates} total candidate{totalCandidates !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-400 px-5 py-2.5 text-sm font-bold text-[#030712] shadow-[0_0_25px_rgba(34,211,238,0.2)] transition hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]"
          >
            <Plus className="h-4 w-4" /> New Job
          </button>
        </div>
      </motion.div>

      {/* Search + View Toggle */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.04] bg-white/[0.015] py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-neon-cyan/15 focus:bg-white/[0.03]"
          />
        </div>
        <div className="flex rounded-xl border border-white/[0.04] bg-white/[0.015]">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-l-xl px-3 py-2 transition ${viewMode === "grid" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-600 hover:text-slate-400"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-r-xl px-3 py-2 transition ${viewMode === "list" ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-600 hover:text-slate-400"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Jobs */}
      {loading ? (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`animate-pulse rounded-2xl border border-white/[0.03] bg-white/[0.015] ${viewMode === "grid" ? "h-44" : "h-20"}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.04] bg-white/[0.01] py-20">
          <Briefcase className="h-10 w-10 text-slate-800" />
          <p className="mt-4 text-sm text-slate-400">{search ? "No jobs match your search" : "No jobs created yet"}</p>
          <p className="mt-1 text-xs text-slate-600">{search ? "Try a different search term" : "Create your first job to start matching candidates"}</p>
          {!search && (
            <button onClick={openCreate} className="mt-5 rounded-xl bg-neon-cyan/10 px-5 py-2 text-xs font-bold text-neon-cyan transition hover:bg-neon-cyan/15">
              Create First Job
            </button>
          )}
        </motion.div>
      ) : viewMode === "grid" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.015] transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025] hover:shadow-[0_0_40px_rgba(34,211,238,0.04)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div onClick={() => router.push(`/dashboard/jobs/${job._id}`)} className="w-full cursor-pointer p-5 text-left">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
                    <Briefcase className="h-4.5 w-4.5 text-neon-cyan/60" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(job); }}
                      className="rounded-lg p-1.5 text-slate-700 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.04] hover:text-slate-300"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }}
                      disabled={deleting === job._id}
                      className="rounded-lg p-1.5 text-slate-700 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/[0.06] hover:text-red-400 disabled:opacity-50"
                    >
                      {deleting === job._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-200 transition group-hover:text-neon-cyan">{job.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{job.description_text}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-full bg-neon-cyan/[0.06] px-2.5 py-1">
                      <Users className="h-3 w-3 text-neon-cyan/60" />
                      <span className="text-[10px] font-bold text-neon-cyan/80">{job.candidate_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Clock className="h-3 w-3" />
                      {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-700 transition group-hover:text-neon-cyan" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {filtered.map((job, i) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.03] bg-white/[0.015] transition hover:border-white/[0.06] hover:bg-white/[0.025]"
            >
              <div className="flex items-center justify-between p-4">
                <button onClick={() => router.push(`/dashboard/jobs/${job._id}`)} className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-200 transition group-hover:text-neon-cyan">{job.title}</p>
                    <span className="flex items-center gap-1 rounded-full bg-neon-cyan/[0.06] px-2 py-0.5 text-[10px] font-bold text-neon-cyan/70">
                      <Users className="h-2.5 w-2.5" /> {job.candidate_count || 0}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-600">{job.description_text}</p>
                </button>
                <div className="flex items-center gap-0.5 pl-3">
                  <span className="mr-2 text-[10px] text-slate-700">
                    {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(job); }} className="rounded-lg p-2 text-slate-600 transition hover:bg-white/[0.04] hover:text-slate-300"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(job._id); }} disabled={deleting === job._id} className="rounded-lg p-2 text-slate-600 transition hover:bg-red-500/[0.06] hover:text-red-400 disabled:opacity-50">
                    {deleting === job._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => router.push(`/dashboard/jobs/${job._id}`)} className="rounded-lg p-2 text-slate-600 transition hover:bg-neon-cyan/[0.06] hover:text-neon-cyan"><ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0a0f1e] p-7 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{editingJob ? "Edit Job" : "Create New Job"}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{editingJob ? "Update position details" : "Add a new position for candidate matching"}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-300"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-neon-cyan/15 focus:bg-white/[0.04]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
                    rows={10}
                    className="w-full resize-none rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-neon-cyan/15 focus:bg-white/[0.04]"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 transition hover:text-slate-200">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-400 px-6 py-2.5 text-sm font-bold text-[#030712] shadow-[0_0_20px_rgba(34,211,238,0.2)] transition hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingJob ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
