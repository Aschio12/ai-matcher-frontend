"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Sun, ChevronLeft, Zap, LogOut } from 'lucide-react';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isDashboard = pathname.startsWith('/dashboard');

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md transition-colors duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Navigation / Logo */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">
                            AI Matcher
                        </span>
                    </Link>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--card)] text-slate-500 hover:text-[var(--foreground)] transition-all border border-transparent hover:border-[var(--border)]"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    {user?.token ? (
                        <button
                            onClick={() => {
                                logout();
                                window.location.href = '/'; // Force redirect to landing
                            }}
                            className="p-2 rounded-full hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-full hover:bg-[var(--border)] transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
