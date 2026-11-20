"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
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
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-4xl rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? "bg-[#111318]/90 border border-[#232733] shadow-lg backdrop-blur-xl"
            : "bg-[#111318]/75 border border-[#1e222d] shadow-md backdrop-blur-md"
        }`}
      >
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs tracking-tight shadow-sm">
            RA
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">ResumeAI</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1c202a] text-[#8c96a8] border border-[#272d3b]">v2.4</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#8c96a8]">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-black bg-white hover:bg-[#e4e7eb] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <span>Scan Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-[#8c96a8] hover:text-white hover:bg-[#1a1e27] transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto absolute top-20 inset-x-4 p-4 rounded-xl bg-[#111318] border border-[#232733] shadow-2xl flex flex-col gap-3 text-sm font-medium">
          <a
            href="#scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-[#181c24] text-zinc-300"
          >
            ATS Scanner
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-[#181c24] text-zinc-300"
          >
            Bento Features
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-[#181c24] text-zinc-300"
          >
            Before & After
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-[#181c24] text-zinc-300"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="py-2 px-3 rounded-lg hover:bg-[#181c24] text-zinc-300"
          >
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
