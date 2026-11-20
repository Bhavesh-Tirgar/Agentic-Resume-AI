"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SquaresBackground } from "@/components/ui/SquaresBackground";
import { ShinyText } from "@/components/ui/ShinyText";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { AmbientAura } from "@/components/ui/AmbientAura";
import { 
  ArrowRight, Upload, CheckCircle2, Shield, 
  FileCheck, Sparkles 
} from "lucide-react";
import { luxuryEasing } from "@/lib/motion";

interface HeroSectionProps {
  onScanClick?: () => void;
  onOpenStudio?: () => void;
}

export function HeroSection({ onScanClick, onOpenStudio }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onScanClick) onScanClick();
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Architectural Grid */}
      <SquaresBackground direction="diagonal" speed={0.3} squareSize={48} />
      <AmbientAura variant="hero" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Copy & Actions (7 Cols) */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-5">
          
          {/* Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: luxuryEasing }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#12151c] border border-slate-200 dark:border-[#202532] shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <ShinyText
              text="Calibrated for engineering leaders"
              className="text-xs font-medium tracking-wide"
              speed={4}
            />
          </motion.div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Resumes engineered for technical interviews.
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: luxuryEasing }}
            className="text-sm sm:text-base text-slate-600 dark:text-[#949ca8] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            Instant ATS diagnostic scoring, quantifiable bullet rewrites, and role alignment without recruiter jargon.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: luxuryEasing }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2"
          >
            {/* Primary Action */}
            <button
              onClick={onOpenStudio || onScanClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white dark:text-black bg-slate-900 dark:bg-white hover:opacity-90 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Launch ATS Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Secondary Action */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium text-slate-800 dark:text-zinc-200 bg-white dark:bg-[#12151c] border border-slate-200 dark:border-[#202533] hover:bg-slate-50 dark:hover:bg-[#181d26] transition cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF to Scan</span>
            </button>
          </motion.div>

          {/* Minimal Trust Signals */}
          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pydantic v2 schemas</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Prompt injection defense</span>
            </span>
            <span>•</span>
            <span>Zero sales spam</span>
          </div>

        </div>

        {/* Right 3D Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <TiltedCard maxAngle={8} className="w-full max-w-md">
            <div className="relative rounded-xl border border-slate-200 dark:border-[#202533] bg-white dark:bg-[#111318] p-5 shadow-xl transition-colors">
              
              {/* Header with ATS Score */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1b1f2b]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#171a23] border border-slate-200 dark:border-[#262c3b] flex items-center justify-center text-slate-900 dark:text-white font-mono text-xs font-bold">
                    91
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Bhavesh Tirgar</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">Senior Systems & AI Engineer</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Tier-1 Match
                </span>
              </div>

              {/* Parsed Competency Badges */}
              <div className="py-3.5 border-b border-slate-100 dark:border-[#1b1f2b] space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block">
                  Audited Technical Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Python / DRF", "LangGraph Agents", "PostgreSQL", "Docker", "Redis"].map((kw, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#151922] border border-slate-200 dark:border-[#202533] text-[10px] font-mono text-slate-700 dark:text-zinc-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantified Bullet Diff */}
              <div className="pt-3.5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 block">
                  Live Bullet Point Calibration
                </span>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-100 dark:border-[#1a1f2b] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                    <span className="text-rose-500 line-through">Built APIs with Django</span>
                    <span className="text-emerald-600 dark:text-emerald-400">+34% Score Impact</span>
                  </div>
                  <p className="text-xs text-slate-900 dark:text-zinc-200 font-medium leading-relaxed">
                    "Architected 14+ REST endpoints in DRF, cutting p99 latency to &lt;45ms across 18k DAU."
                  </p>
                </div>
              </div>

            </div>
          </TiltedCard>
        </div>

      </div>
    </section>
  );
}
