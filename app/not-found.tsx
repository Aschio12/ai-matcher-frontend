"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Cpu, Wifi } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan/[0.025] blur-[180px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 scanline" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
          <Wifi className="h-7 w-7 text-neon-cyan/30" />
        </div>
        <motion.p
          className="mt-6 text-8xl font-bold tracking-tighter text-gradient"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.p>
        <p className="mt-3 text-sm font-semibold text-slate-400">Neural pathway not found</p>
        <p className="mt-1 text-xs text-slate-600">The requested route does not exist in this system</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-400 px-6 py-2.5 text-xs font-bold text-[#030712] shadow-[0_0_25px_rgba(34,211,238,0.2)] transition hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
