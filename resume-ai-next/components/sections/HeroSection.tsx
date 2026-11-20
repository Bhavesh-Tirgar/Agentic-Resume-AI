"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SquaresBackground } from "@/components/ui/SquaresBackground";
import { ShinyText } from "@/components/ui/ShinyText";
import { SplitText } from "@/components/ui/SplitText";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { AmbientAura } from "@/components/ui/AmbientAura";
import { 
  ArrowRight, Upload, Sparkles, CheckCircle2, Shield, 
  FileCheck, Cpu, TrendingUp, Zap, Star 
} from "lucide-react";
import { luxuryEasing } from "@/lib/motion";

interface HeroSectionProps {
  onScanClick?: () => void;
}

export function HeroSection({ onScanClick }: HeroSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (onScanClick) onScanClick();
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Backgrounds */}
      <SquaresBackground
        direction="diagonal"
        speed={0.4}
        squareSize={48}
        borderColor="rgba(255, 255, 255, 0.03)"
        hoverFillColor="rgba(16, 185, 129, 0.07)"
      />
      <AmbientAura variant="hero" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Copy & Conversion Actions (7 Cols) */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          
          {/* Floating Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEasing }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-[0_0_24px_rgba(16,185,129,0.15)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShinyText
              text="✨ Ranked #1 AI Resume Builder & ATS Scanner"
              className="text-xs font-semibold tracking-wide"
              speed={4}
            />
          </motion.div>

          {/* Kinetic Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-white leading-[1.08]">
            <SplitText
              text="Craft Resumes That Beat the ATS & Land 3x More Interviews"
              highlightWords={["Beat", "ATS", "3x", "Interviews"]}
              highlightClass="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy underline-offset-4"
              delay={0.035}
            />
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: luxuryEasing }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            Upload your resume or paste a job link. Our multi-agent AI rewrites weak bullets, fixes keyword blind spots, and generates recruiter-ready applications in seconds.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: luxuryEasing }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            {/* Primary Magnetic CTA */}
            <button
              onClick={onScanClick}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_0_35px_rgba(16,185,129,0.45)] hover:shadow-[0_0_45px_rgba(16,185,129,0.65)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Build My Resume Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Frosted Upload Trigger */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.09] backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload PDF (Instant ATS Score)</span>
            </button>
          </motion.div>

          {/* Micro Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-zinc-500 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workday & Taleo Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Private • No Data Training</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
              <span className="text-zinc-300 font-semibold">4.9/5</span>
              <span>(12,400+ Resumes Scored)</span>
            </div>
          </motion.div>
        </div>

        {/* Right 3D Tilted Mockup (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <TiltedCard maxAngle={10} className="w-full max-w-md">
            <div className="relative rounded-2xl bg-zinc-950/90 border border-zinc-800/90 p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
              
              {/* Glowing Top ATS Score Pill */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">ATS Diagnostic Score</h2>
                    <p className="text-[10px] text-zinc-500 font-mono">Workday Screener Engine v4.2</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <span className="text-base font-black font-mono">98</span>
                  <span className="text-[10px] font-mono text-emerald-400/80">/100</span>
                </div>
              </div>

              {/* Mock Resume Document Interior */}
              <div className="mt-4 space-y-3.5 text-left text-xs">
                
                {/* Candidate Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight">Alex Rivera</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Senior Systems Lead</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono">San Francisco, CA • alex.rivera@tech.io • github.com/arivera</p>
                </div>

                {/* Keyword Highlights */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    High-Impact Keyword Matches:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      Kubernetes (+24%)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      Distributed Systems
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      Kafka Pipelines
                    </span>
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono text-[10px]">
                      LangGraph Agents
                    </span>
                  </div>
                </div>

                {/* Experience Bullet Demonstration */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">Staff Infrastructure Engineer</span>
                    <span className="text-zinc-500 font-mono">2023 - Present</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed pl-2 border-l-2 border-emerald-500/60">
                    Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually.
                  </p>
                </div>

                {/* Real-time Floating AI Suggestion Pill */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-950/80 via-zinc-900 to-zinc-950 border border-violet-500/40 shadow-[0_8px_25px_rgba(139,92,246,0.25)] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="text-[11px] text-zinc-200">
                      <strong>AI Suggestion:</strong> Added quantified ARR metric (+$1.2M)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    +14% ATS
                  </span>
                </motion.div>
              </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </section>
  );
}
