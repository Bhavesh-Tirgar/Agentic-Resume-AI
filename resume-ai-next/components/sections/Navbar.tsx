"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Menu, X, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  onUploadClick?: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-zinc-950/85 border border-zinc-800 shadow-[0_12px_40px_0_rgba(0,0,0,0.55)]"
            : "backdrop-blur-md bg-zinc-950/70 border border-zinc-800/80 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        }`}
      >
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 p-[1px] shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">Resume<span className="text-emerald-400">AI</span></span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">PRO</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a href="#scanner" className="hover:text-white transition-colors">ATS Scanner</a>
          <a href="#features" className="hover:text-white transition-colors">Bento Features</a>
          <a href="#showcase" className="hover:text-white transition-colors">Before & After</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUploadClick}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_28px_rgba(16,185,129,0.55)] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Scan Resume Free</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto absolute top-20 inset-x-4 p-4 rounded-2xl bg-zinc-950/95 border border-zinc-800 backdrop-blur-2xl shadow-2xl flex flex-col gap-3 text-sm font-medium">
          <a
            href="#scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300"
          >
            ATS Scanner
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300"
          >
            Bento Features
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300"
          >
            Before & After
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-zinc-900 text-zinc-300"
          >
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
