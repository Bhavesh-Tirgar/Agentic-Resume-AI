"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export type NavTab = "overview" | "studio" | "matcher" | "interview";

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onUploadClick?: () => void;
}

export function Navbar({ currentTab, onTabChange, onUploadClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? "dark:bg-[#111318]/90 bg-white/90 dark:border-[#232733] border-slate-200/80 shadow-lg backdrop-blur-xl"
            : "dark:bg-[#111318]/80 bg-white/80 dark:border-[#1e222d] border-slate-200 shadow-sm backdrop-blur-md"
        }`}
      >
        {/* Brand Logo */}
        <button
          onClick={() => onTabChange("overview")}
          className="flex items-center gap-2.5 cursor-pointer text-left"
        >
          <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-xs tracking-tight shadow-sm">
            RA
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">ResumeAI</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#1c202a] text-slate-500 dark:text-[#8c96a8] border border-slate-200 dark:border-[#272d3b]">v2.4</span>
          </div>
        </button>

        {/* View Switcher Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#0c0e14] p-1 rounded-full border border-slate-200 dark:border-[#1a1e28] text-xs font-medium">
          <button
            onClick={() => onTabChange("overview")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentTab === "overview"
                ? "bg-white dark:bg-[#191d27] text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange("studio")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentTab === "studio"
                ? "bg-white dark:bg-[#191d27] text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            ATS Studio
          </button>
          <button
            onClick={() => onTabChange("matcher")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentTab === "matcher"
                ? "bg-white dark:bg-[#191d27] text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Job Matcher
          </button>
          <button
            onClick={() => onTabChange("interview")}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              currentTab === "interview"
                ? "bg-white dark:bg-[#191d27] text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Interview Cockpit
          </button>
        </nav>

        {/* Action Controls: Theme Toggle & Launch Button */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-full text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1e27] border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 transition cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Launch Studio CTA */}
          <button
            onClick={onUploadClick || (() => onTabChange("studio"))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white dark:text-black bg-slate-900 dark:bg-white hover:opacity-90 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1e27] transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto absolute top-20 inset-x-4 p-4 rounded-xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#232733] shadow-2xl flex flex-col gap-2.5 text-sm font-medium">
          <button
            onClick={() => {
              onTabChange("overview");
              setMobileMenuOpen(false);
            }}
            className={`text-left px-3 py-2 rounded-lg transition ${
              currentTab === "overview" ? "bg-slate-100 dark:bg-[#191d27] font-semibold" : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              onTabChange("studio");
              setMobileMenuOpen(false);
            }}
            className={`text-left px-3 py-2 rounded-lg transition ${
              currentTab === "studio" ? "bg-slate-100 dark:bg-[#191d27] font-semibold" : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            ATS Studio & Dossier
          </button>
          <button
            onClick={() => {
              onTabChange("matcher");
              setMobileMenuOpen(false);
            }}
            className={`text-left px-3 py-2 rounded-lg transition ${
              currentTab === "matcher" ? "bg-slate-100 dark:bg-[#191d27] font-semibold" : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            Job Description Matcher
          </button>
          <button
            onClick={() => {
              onTabChange("interview");
              setMobileMenuOpen(false);
            }}
            className={`text-left px-3 py-2 rounded-lg transition ${
              currentTab === "interview" ? "bg-slate-100 dark:bg-[#191d27] font-semibold" : "text-slate-600 dark:text-zinc-400"
            }`}
          >
            STAR Interview Cockpit
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-[#1e2330] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-100 dark:bg-[#1a1e27] text-slate-800 dark:text-zinc-200"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
