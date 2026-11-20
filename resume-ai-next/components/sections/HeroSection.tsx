"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SquaresBackground } from "@/components/ui/SquaresBackground";
import { ShinyText } from "@/components/ui/ShinyText";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { AmbientAura } from "@/components/ui/AmbientAura";
import { 
  ArrowRight, Upload, CheckCircle2, Shield, 
  FileCheck, Star 
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
    <section className="relative min-h-[88vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Architectural Grid & Subtle Vignette */}
      <SquaresBackground
        direction="diagonal"
        speed={0.3}
        squareSize={48}
        borderColor="rgba(255, 255, 255, 0.02)"
        hoverFillColor="rgba(255, 255, 255, 0.03)"
      />
      <AmbientAura variant="hero" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Copy & Actions (7 Cols) */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-6">
          
          {/* Subtle Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: luxuryEasing }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12151c] border border-[#202532] shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            <ShinyText
              text="Ranked #1 AI Resume Builder & ATS Scanner"
              className="text-xs font-medium tracking-wide"
              speed={4}
            />
          </motion.div>

          {/* Solid White Headline (No Gradients) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-white leading-[1.08]">
            Craft Resumes That Beat the ATS & Land 3x More Interviews
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: luxuryEasing }}
            className="text-sm sm:text-base text-[#949ca8] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            Upload your resume or paste a job link. Our multi-agent AI rewrites weak bullets into quantified accomplishments, fixes ATS blind spots, and aligns keyword density in seconds.
          </motion.p>

          {/* Dual CTAs (Solid White & Titanium) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: luxuryEasing }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
          >
            {/* Primary Action */}
            <button
              onClick={onScanClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-semibold text-black bg-white hover:bg-[#e4e7eb] shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Build My Resume Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Secondary Action */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold text-[#c8cfdc] bg-[#141720] hover:bg-[#1a1f2b] border border-[#222836] transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#8c96a8]" />
              <span>Upload PDF (Instant ATS Score)</span>
            </button>
          </motion.div>

          {/* Micro Trust Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-3 text-xs text-[#626b79] font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Workday & Taleo Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>100% Private • Ephemeral Ingestion</span>
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

        {/* Right 3D Tilted Card (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <TiltedCard maxAngle={8} className="w-full max-w-md">
            <div className="relative rounded-xl bg-[#111318] border border-[#20242e] p-5 shadow-2xl transition-colors hover:border-[#2d3342]">
              
              {/* Top ATS Score Pill */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#1c202a]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8]">
                    <FileCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-tight">ATS Diagnostic Score</h2>
                    <p className="text-[10px] text-[#626b79] font-mono">Workday Screener Engine v4.2</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#132017] border border-[#1e3c25] text-[#4ade80] font-mono">
                  <span className="text-sm font-bold">98</span>
                  <span className="text-[10px] text-[#4ade80]/70">/100</span>
                </div>
              </div>

              {/* Mock Resume Document Interior */}
              <div className="mt-4 space-y-3.5 text-left text-xs">
                
                {/* Candidate Header */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight">Alex Rivera</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#171b23] border border-[#222733] text-[#8c96a8]">Senior Systems Lead</span>
                  </div>
                  <p className="text-[11px] text-[#626b79] font-mono">San Francisco, CA • alex.rivera@tech.io • github.com/arivera</p>
                </div>

                {/* Keyword Highlights */}
                <div className="p-2.5 rounded-lg bg-[#0e1015] border border-[#1b1f29] space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#626b79] block">
                    Verified Keyword Alignment:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#222735] text-[#b8c2d1] font-mono text-[10px]">
                      Kubernetes (+24%)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#222735] text-[#b8c2d1] font-mono text-[10px]">
                      Distributed Systems
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#222735] text-[#b8c2d1] font-mono text-[10px]">
                      Kafka Pipelines
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#151922] border border-[#222735] text-[#b8c2d1] font-mono text-[10px]">
                      LangGraph Agents
                    </span>
                  </div>
                </div>

                {/* Experience Bullet Demonstration */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">Staff Infrastructure Engineer</span>
                    <span className="text-[#626b79] font-mono">2023 - Present</span>
                  </div>
                  <p className="text-[11px] text-[#949ca8] leading-relaxed pl-2 border-l-2 border-[#202532]">
                    Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually.
                  </p>
                </div>

                {/* Real-time Floating AI Suggestion Pill */}
                <div className="p-2.5 rounded-lg bg-[#141720] border border-[#222836] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-[#c4ccd9]">
                    <strong className="text-white">AI Suggestion:</strong> Added quantified ARR metric (+$1.2M)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#152319] border border-[#22442a] text-[#4ade80] font-semibold">
                    +14% ATS
                  </span>
                </div>
              </div>
            </div>
          </TiltedCard>
        </div>
      </div>
    </section>
  );
}
