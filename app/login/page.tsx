"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/access", {
        email,
        password,
      });

      const token = response.data?.token;

      if (!token) {
        throw new Error("Missing token in response");
      }

      login(token);
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-200">
      {/* Animated cyberpunk radial gradient background */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-40 opacity-60"
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(34,211,238,0.28), transparent 55%), radial-gradient(circle at 100% 100%, rgba(244,114,182,0.24), transparent 50%)",
        }}
      />

      {/* Glow lines */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.7, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-10 w-px bg-gradient-to-b from-transparent via-neon-pink/60 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.6, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-md rounded-3xl border border-transparent bg-white/5 p-[1px] shadow-[0_0_40px_rgba(15,23,42,0.8)]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(34,211,238,0.9), rgba(244,114,182,0.9))",
        }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="rounded-[1.4rem] bg-slate-950/80 px-8 py-10 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.7)]">
              <ShieldCheck className="h-6 w-6 text-neon-cyan" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                AI Matcher
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50">
                Sign in to your console
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 shadow-inner outline-none transition focus:border-neon-cyan/70 focus:ring-2 focus:ring-neon-cyan/40"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 shadow-inner outline-none transition focus:border-neon-cyan/70 focus:ring-2 focus:ring-neon-cyan/40"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neon-cyan px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.85)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <span className="relative z-10">
                {loading ? "Logging you in..." : "Login"}
              </span>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60"
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  boxShadow: [
                    "0 0 20px rgba(34,211,238,0.75)",
                    "0 0 35px rgba(34,211,238,1)",
                    "0 0 20px rgba(34,211,238,0.75)",
                  ],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          </form>

          {error && (
            <motion.p
              className="mt-5 text-center text-xs font-medium text-neon-pink"
              initial={{ opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                x: [0, -4, 4, -3, 3, -2, 2, 0],
              }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.p>
          )}

          <p className="mt-6 text-center text-[11px] text-slate-500">
            Protected cyber console. Unauthorized access will be{" "}
            <span className="text-neon-pink">denied</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

