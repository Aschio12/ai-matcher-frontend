"use client";

import { motion } from "framer-motion";
import { CircleHelp, FileUp, Sparkles, CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function HelpPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          <CircleHelp className="h-3 w-3 text-neon-cyan/50" />
          Help
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-100">Using AI Matcher</h1>
        <p className="mt-1 text-sm text-slate-500">Short guide for recruiters</p>
      </motion.div>

      <div className="space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <FileUp className="h-4 w-4 text-neon-cyan" />
            Uploading CVs
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-400">
            <li>Open a job, then drop a file or click to browse. Supported: PDF, DOCX, TXT.</li>
            <li>You’ll see progress while the file uploads, text is extracted, and OpenAI scores the match.</li>
            <li><span className="text-slate-300">Scanned PDFs</span> (photos of pages) often have no extractable text — use a text PDF or Word file when possible.</li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sparkles className="h-4 w-4 text-neon-purple" />
            AI match scores
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Scores and summaries come from OpenAI (e.g. GPT-4o-mini) on your own API key. If you see a billing or quota message, add credits and ensure{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-neon-cyan/90">OPENAI_API_KEY</code>{" "}
            in the backend <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px]">.env</code> is correct, then restart the server.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-amber-500/[0.12] bg-amber-500/[0.04] p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-200/90">
            <CreditCard className="h-4 w-4" />
            “Quota” or “billing” errors
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            OpenAI API usage is paid. Visit{" "}
            <a href="https://platform.openai.com/settings/organization/billing" target="_blank" rel="noopener noreferrer" className="text-neon-cyan underline decoration-neon-cyan/30 hover:decoration-neon-cyan">
              OpenAI billing
            </a>{" "}
            to add a payment method or check usage limits. After fixing billing, upload the CV again (or delete the old row and re-upload the same file).
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 pt-2"
        >
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.07]"
          >
            Back to overview
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
