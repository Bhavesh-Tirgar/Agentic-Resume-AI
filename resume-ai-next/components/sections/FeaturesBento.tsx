"use client";

import React, { useState, useEffect } from "react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { 
  FileCheck, Terminal, LayoutTemplate, CheckCircle2, 
  ArrowRight, Wand2, RefreshCw, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FeaturesBento() {
  const [atsScore] = useState(94);
  const [tailorStep, setTailorStep] = useState<"before" | "after">("after");

  const fullLetterText = `Dear Hiring Team,

As a Senior Distributed Systems Engineer with 6+ years designing event-driven microservices in Python and Kubernetes, I scaled transactional throughput to 45,000 req/sec while maintaining 99.99% availability.

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

  const [activeTemplate, setActiveTemplate] = useState<"tech" | "harvard" | "executive">("tech");

  const templates = [
    {
      id: "tech",
      name: "Tech Modern",
      desc: "Clean monospace metadata, single-column linear layout, preferred by Meta, Google, and Stripe.",
    },
    {
      id: "harvard",
      name: "Harvard Classic",
      desc: "Formal typographic hierarchy, ideal for tier-1 enterprises and management roles.",
    },
    {
      id: "executive",
      name: "Executive Minimalist",
      desc: "High information density, executive summary lead, and quantifiable ROI focus.",
    },
  ];

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  return (
    <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[#626b79]">
          Platform Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Everything You Need to Beat the ATS Filter
        </h2>
        <p className="text-[#8c96a8] text-sm sm:text-base leading-relaxed">
          Engineered with proprietary ATS parsing diagnostics, real-time job description tailoring, and semantic keyword matching.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1 (Large 2-col - Live ATS Diagnostic) */}
        <SpotlightCard
          spotlightColor="rgba(255, 255, 255, 0.04)"
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1f232e]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8]">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Real-Time ATS Screening Engine</h3>
                  <p className="text-xs text-[#626b79]">Simulates Workday, Greenhouse, Taleo & Lever parsers</p>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#132017] border border-[#1e3c25] text-[#4ade80] font-semibold">
                Passed 14/14 Checks
              </span>
            </div>

            {/* Inner Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-6 items-center">
              
              {/* Circular Gauge */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-lg bg-[#0d0f14] border border-[#1b1f29]">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="#1e222d"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="#22c55e"
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white font-mono">{atsScore}</span>
                    <span className="text-[10px] text-[#626b79] font-mono uppercase">ATS Index</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8c96a8] text-center mt-2.5">
                  Top <strong className="text-white">3%</strong> of screened software resumes
                </p>
              </div>

              {/* Checklist Pass/Fail */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-md bg-[#0d0f14] border border-[#1c202a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span className="text-[#c4ccd9]">Parseable Single-Column Hierarchy</span>
                  </div>
                  <span className="text-[#4ade80] font-mono text-[11px]">100% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-[#0d0f14] border border-[#1c202a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span className="text-[#c4ccd9]">Quantifiable Impact Metrics Detected</span>
                  </div>
                  <span className="text-[#4ade80] font-mono text-[11px]">96% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-[#0d0f14] border border-[#1c202a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span className="text-[#c4ccd9]">Hard Technical Keyword Density</span>
                  </div>
                  <span className="text-[#4ade80] font-mono text-[11px]">91% PASS</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md bg-[#0d0f14] border border-[#1c202a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span className="text-[#c4ccd9]">Binary Header & Standard Clean Fonts</span>
                  </div>
                  <span className="text-[#4ade80] font-mono text-[11px]">100% PASS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#1b1f29] flex items-center justify-between text-xs text-[#626b79] font-mono">
            <span>Audit Latency: 1.2s</span>
            <span className="text-white flex items-center gap-1 hover:underline cursor-pointer">
              <span>Ready for One-Click Download</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </SpotlightCard>

        {/* Card 2 (1-col - 1-Click Job Tailor) */}
        <SpotlightCard
          spotlightColor="rgba(255, 255, 255, 0.04)"
          className="flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f232e]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8]">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">1-Click Job Tailor</h3>
                  <p className="text-[11px] text-[#626b79]">Instant bullet morphing</p>
                </div>
              </div>

              <button
                onClick={() => setTailorStep(tailorStep === "before" ? "after" : "before")}
                className="p-1 rounded bg-[#171b23] hover:bg-[#202532] text-[#8c96a8] hover:text-white border border-[#232836] transition cursor-pointer"
                title="Toggle Morph State"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase text-[#626b79]">Target Role:</span>
                <span className="font-mono text-zinc-300 font-semibold text-[11px]">Senior Backend Lead</span>
              </div>

              <div className="relative min-h-[135px] p-3 rounded-lg border transition-all duration-300 bg-[#0d0f14] border-[#1c202a]">
                <AnimatePresence mode="wait">
                  {tailorStep === "before" ? (
                    <motion.div
                      key="before"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5"
                    >
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#251417] border border-[#421d23] text-rose-400 font-medium block w-max">
                        Before (Weak & Passive):
                      </span>
                      <p className="text-xs text-[#8c96a8] leading-relaxed">
                        "Worked on backend APIs using Python and Django for our web application and fixed bugs."
                      </p>
                      <span className="text-[10px] text-rose-400/80 block pt-0.5">
                        ⚠️ 0 metrics, passive phrasing, missing scale.
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="after"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1.5"
                    >
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#132017] border border-[#1e3c25] text-[#4ade80] font-medium block w-max">
                        After AI Optimization:
                      </span>
                      <p className="text-xs text-white font-medium leading-relaxed">
                        "Architected 12+ RESTful services in Django REST Framework, decreasing p99 latency to &lt;45ms under 15k concurrent DAU."
                      </p>
                      <span className="text-[10px] text-[#4ade80] block pt-0.5 font-mono">
                        ✨ +32% ATS keyword density & quantified throughput.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-[#1b1f29] flex items-center justify-between text-xs text-[#626b79]">
            <span>Click reload icon to switch</span>
            <span className="font-mono text-[11px] text-white">Active</span>
          </div>
        </SpotlightCard>

        {/* Card 3 (1-col - AI Cover Letter Writer) */}
        <SpotlightCard
          spotlightColor="rgba(255, 255, 255, 0.04)"
          className="flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1f232e]">
              <div className="w-7 h-7 rounded-md bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI Cover Letter Drafter</h3>
                <p className="text-[11px] text-[#626b79]">Executive streaming generation</p>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="mt-4 p-3 rounded-lg bg-[#0a0b0e] border border-[#1a1e27] font-mono text-[11px] leading-relaxed min-h-[160px] text-[#c4ccd9]">
              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#161922] text-[#626b79] text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#353b49]" />
                <span className="ml-1">cover_letter_stream.sh</span>
              </div>
              <p className="whitespace-pre-line text-[#9ba3af]">
                {displayedText}
                <span className="inline-block w-1.5 h-3 bg-white ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          </div>

          <div className="pt-3.5 border-t border-[#1b1f29] flex items-center justify-between text-xs text-[#626b79] font-mono">
            <span>Model: Gemini 2.5 Flash</span>
            <span className="text-white">Streaming Live</span>
          </div>
        </SpotlightCard>

        {/* Card 4 (2-col - Template Architecture) */}
        <SpotlightCard
          spotlightColor="rgba(255, 255, 255, 0.04)"
          className="lg:col-span-2 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1f232e]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8]">
                  <LayoutTemplate className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">ATS-Optimized Template Architecture</h3>
                  <p className="text-[11px] text-[#626b79]">Single-column layout with 100% parser fidelity</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-[#8c96a8]">3 Master Presets</span>
            </div>

            {/* Template Gallery Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id as any)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    activeTemplate === tpl.id
                      ? "bg-[#181c25] border-[#384155]"
                      : "bg-[#0d0f14] border-[#1c202a] hover:border-[#2a3040]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-white tracking-tight">{tpl.name}</span>
                    {activeTemplate === tpl.id ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-[#2b313f]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#8c96a8] leading-relaxed">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3.5 border-t border-[#1b1f29] flex items-center justify-between text-xs text-[#626b79] font-mono">
            <span>Export Formats: PDF & DOCX</span>
            <span className="text-white">Zero Parsing Errors Guarantee</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
