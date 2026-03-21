"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  CircleHelp,
  LogOut,
  Cpu,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Help", href: "/dashboard/help", icon: CircleHelp },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#030712]">
        {/* Ambient background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-neon-cyan/[0.02] blur-[180px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-neon-purple/[0.015] blur-[180px]" />
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-neon-pink/[0.01] blur-[200px]" />
          <div className="absolute inset-0 scanline" />
        </div>

        {/* Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 68 : 240 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="relative z-20 flex flex-col border-r border-white/[0.03] bg-[#060b18]/95 backdrop-blur-2xl"
        >
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/[0.03] px-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
              <Cpu className="h-4.5 w-4.5 text-neon-cyan" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-bold tracking-wider text-gradient">AI MATCHER</p>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-slate-600">v3.0</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User section */}
          <div className="border-b border-white/[0.03] px-3 py-3">
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10">
                <User className="h-3.5 w-3.5 text-neon-cyan/70" />
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-[11px] font-semibold text-slate-300">Recruiter</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                      <span className="text-[9px] font-medium text-emerald-400/70">Online</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Nav */}
          <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-2.5">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-1 px-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700"
                >
                  Navigation
                </motion.p>
              )}
            </AnimatePresence>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all ${
                    active
                      ? "bg-neon-cyan/[0.07] text-neon-cyan shadow-[inset_0_0_20px_rgba(34,211,238,0.03)]"
                      : "text-slate-500 hover:bg-white/[0.02] hover:text-slate-300"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    />
                  )}
                  <item.icon className={`h-4 w-4 shrink-0 transition ${active ? "text-neon-cyan" : "group-hover:text-slate-400"}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !collapsed && (
                    <motion.div
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/[0.03] p-2.5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-red-500/[0.06] hover:text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-[4.5rem] z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.06] bg-[#060b18] text-slate-600 transition hover:border-neon-cyan/20 hover:text-neon-cyan"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </motion.aside>

        {/* Main */}
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
