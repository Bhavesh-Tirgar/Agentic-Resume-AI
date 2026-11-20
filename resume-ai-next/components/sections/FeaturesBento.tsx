"use client";

import React, { useState, useEffect } from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { 
  FileCheck, Sparkles, Terminal, LayoutTemplate, CheckCircle2, 
  XCircle, ArrowRight, Wand2, RefreshCw, Copy, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FeaturesBento() {
  // Card 1: Gauge Meter State
  const [atsScore, setAtsScore] = useState(94);

  // Card 2: 1-Click Job Tailor Morph State
  const [tailorStep, setTailorStep] = useState<"before" | "after">("after");

  // Card 3: Cover Letter Terminal Typing
  const fullLetterText = `Dear Hiring Team,

As a Senior Distributed Systems Engineer with 6+ years designing event-driven microservices in Python and Kubernetes, I scaled our transactional throughput to 45,000 req/sec while maintaining 99.99% availability.

I would love to bring this architectural rigor to your Core Infrastructure team.`;

  const [displayedText, setDisplayedText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    if (typingIndex < fullLetterText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullLetterText[typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayedText("");
        setTypingIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }
  }, [typingIndex, fullLetterText]);

  // Card 4: Template Selector
  const [activeTemplate, setActiveTemplate] = useState<"harvard" | "tech" | "executive">("tech");

  const templates = [
    {
      id: "tech",
      name: "Tech Modern",
      accent: "border-emerald-500",
      desc: "Clean monospace metadata, single-column linear layout, preferred by Meta, Google, and Stripe.",
    },
    {
      id: "harvard",
      name: "Harvard Classic",
      accent: "border-zinc-400",
      desc: "Serif typography, formal hierarchy, ideal for finance, consulting, and tier-1 enterprises.",
    },
    {
      id: "executive",
      name: "Executive Minimalist",
      accent: "border-violet-500",
      desc: "High information density, executive summary lead, and quantifiable ROI focus.",
    },
  ];

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Bento Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white">
          Everything You Need to Outperform 99% of Applicants
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Engineered with proprietary ATS parsing diagnostics, real-time job description tailoring, and semantic keyword matching.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 (Large 2-col - Live ATS Diagnostic) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Real-Time ATS Screening Engine</h3>
                  <p className="text-xs text-zinc-400">Simulates Workday, Greenhouse, Taleo & Lever parsers</p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Passed 14/14 Checks
              </span>
            </div>

            {/* Inner Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-6 items-center">
              
              {/* Circular Gauge */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="#27272a"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-white font-mono">{atsScore}</span>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">ATS Index</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 text-center mt-3">
                  Score in the <strong className="text-emerald-400">top 3%</strong> of screened resumes
                </p>
              </div>

              {/* Checklist Pass/Fail */}
              <div className="sm:col-span-7 space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200">Parseable Single-Column Hierarchy</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">100% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200">Quantifiable Impact Metrics Detected</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">96% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200">Hard Technical Keyword Density</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">91% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200">Binary Header & Clean Fonts</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">100% PASS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Audit Latency: 1.2s</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span>Ready for One-Click Download</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2 (1-col - 1-Click Job Tailor) */}
        <SpotlightCard
          spotlightColor="rgba(139, 92, 246, 0.16)"
          className="flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">1-Click Job Tailor</h3>
                  <p className="text-[11px] text-zinc-400">Instant bullet morphing</p>
                </div>
              </div>

              <button
                onClick={() => setTailorStep(tailorStep === "before" ? "after" : "before")}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Toggle Morph State"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase text-zinc-500">Target Role:</span>
                <span className="font-mono text-zinc-300 font-semibold text-[11px]">Senior Backend Lead</span>
              </div>

              <div className="relative min-h-[140px] p-4 rounded-xl border transition-all duration-300 bg-zinc-900/60 border-zinc-800">
                <AnimatePresence mode="wait">
                  {tailorStep === "before" ? (
                    <motion.div
                      key="before"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold block w-max">
                        Before (Weak & Passive):
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        "Worked on backend APIs using Python and Django for our web application and fixed bugs."
                      </p>
                      <span className="text-[10px] text-rose-400/80 block pt-1">
                        ⚠️ 0 metrics, passive phrasing, missing scale.
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="after"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold block w-max">
                        After AI Optimization:
                      </span>
                      <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                        "Architected 12+ RESTful services in Django REST Framework, decreasing p99 latency to &lt;45ms under 15k concurrent DAU."
                      </p>
                      <span className="text-[10px] text-emerald-400 block pt-1 font-mono">
                        ✨ +32% ATS keyword density & quantified throughput.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Click to switch comparison</span>
            <span className="text-violet-400 font-mono text-[11px]">Active</span>
          </div>
        </SpotlightCard>

        {/* Card 3 (1-col - AI Cover Letter Writer) */}
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.16)"
          className="flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI Cover Letter Drafter</h3>
                <p className="text-[11px] text-zinc-400">Executive streaming generation</p>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] leading-relaxed min-h-[170px] text-zinc-300">
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-zinc-900 text-zinc-600 text-[10px]">
                <div className="w-2 h-2 rounded-full bg-rose-500/70" />
                <div className="w-2 h-2 rounded-full bg-amber-500/70" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                <span className="ml-2">stream_cover_letter.sh</span>
              </div>
              <p className="whitespace-pre-line text-zinc-400">
                {displayedText}
                <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse align-middle" />
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Model: Gemini 2.5 Flash</span>
            <span className="text-sky-400">Streaming Live</span>
          </div>
        </SpotlightCard>

        {/* Card 4 (2-col - ATS-Friendly Template Gallery) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.16)"
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">ATS-Optimized Template Architecture</h3>
                  <p className="text-[11px] text-zinc-400">Strictly engineered to parse with 100% fidelity</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-zinc-400">3 Master Presets</span>
            </div>

            {/* Template Gallery Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id as any)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    activeTemplate === tpl.id
                      ? "bg-zinc-900 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white tracking-tight">{tpl.name}</span>
                    {activeTemplate === tpl.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Export Formats: PDF & DOCX</span>
            <span className="text-emerald-400">Zero Parsing Errors Guarantee</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
