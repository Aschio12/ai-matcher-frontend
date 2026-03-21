"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, Loader2, Fingerprint, Shield, Zap, Brain } from "lucide-react";
import api from "../../lib/api";
import { useAuth } from "../../context/auth-context";

const TYPING_LINES = [
  "Initializing neural matching engine...",
  "Loading GPT-4o analysis protocols...",
  "Resume parsing pipeline ready.",
  "Candidate scoring algorithms loaded.",
  "System online. Awaiting authentication.",
];

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const PARTICLE_COUNT = 60;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

function TypingEffect() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    if (lineIndex >= TYPING_LINES.length) return;
    const line = TYPING_LINES[lineIndex];
    if (charIndex < line.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 20);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setDisplayed((d) => [...d, line]);
      setLineIndex((l) => l + 1);
      setCharIndex(0);
    }, 300);
    return () => clearTimeout(t);
  }, [lineIndex, charIndex]);

  return (
    <div className="font-mono text-[10px] leading-relaxed text-slate-600 select-none">
      {displayed.map((l, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-emerald-500/60">&#10003;</span> {l}
        </div>
      ))}
      {lineIndex < TYPING_LINES.length && (
        <div className="flex items-center gap-1.5">
          <span className="text-neon-cyan/50">$</span>
          {TYPING_LINES[lineIndex].slice(0, charIndex)}
          <span className="inline-block h-3 w-[2px] animate-pulse bg-neon-cyan/60" />
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useParticles(canvasRef);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post("/auth/access", { email, password });
      const token = response.data?.token;
      if (!token) throw new Error("Missing token in response");
      login(token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router]);

  const features = [
    { icon: Brain, label: "GPT-4o Analysis", desc: "AI-powered resume scoring" },
    { icon: Zap, label: "Instant Results", desc: "Real-time match processing" },
    { icon: Shield, label: "Secure Platform", desc: "Enterprise-grade security" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-neon-cyan/[0.03] blur-[200px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-neon-purple/[0.03] blur-[200px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="pointer-events-none absolute inset-0 scanline" />

      <div className="relative z-10 flex w-full max-w-5xl items-center gap-20 px-6">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="hidden flex-1 lg:block"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
              <Cpu className="h-7 w-7 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gradient">AI MATCHER</h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-600">
                Neural Recruitment Engine
              </p>
            </div>
          </div>

          <p className="mb-8 max-w-md text-[15px] leading-relaxed text-slate-400">
            Upload resumes and get instant AI-powered match scores, strengths analysis,
            and gap detection — transforming how you evaluate talent.
          </p>

          <div className="mb-8 space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.03] bg-white/[0.015] px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-cyan/[0.06]">
                  <f.icon className="h-4 w-4 text-neon-cyan/70" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{f.label}</p>
                  <p className="text-[10px] text-slate-500">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4">
            <TypingEffect />
          </div>
        </motion.div>

        {/* Right — Login Card */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-neon-pink/20 p-px shadow-[0_0_80px_rgba(34,211,238,0.06)]">
            <div className="rounded-[calc(1.5rem-1px)] bg-[#0a0f1e]/95 px-8 py-10 backdrop-blur-xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-cyan/[0.08]">
                  <Fingerprint className="h-5 w-5 text-neon-cyan" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-100">
                    Authenticate
                  </h1>
                  <p className="text-[10px] font-medium text-slate-500">
                    Secure neural interface
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-neon-cyan/20 focus:bg-white/[0.04] focus:shadow-[0_0_30px_rgba(34,211,238,0.04)]"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-neon-cyan/20 focus:bg-white/[0.04] focus:shadow-[0_0_30px_rgba(34,211,238,0.04)]"
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyan-400 px-4 py-3 text-sm font-bold text-[#030712] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-all hover:shadow-[0_0_50px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Access Console
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {error && (
                <motion.div
                  className="mt-5 rounded-lg border border-neon-pink/10 bg-neon-pink/[0.04] px-4 py-2.5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-center text-xs font-medium text-neon-pink">{error}</p>
                </motion.div>
              )}

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-700">
                <div className="h-1 w-1 rounded-full bg-emerald-500/50 animate-pulse" />
                System operational &middot; v3.0
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
