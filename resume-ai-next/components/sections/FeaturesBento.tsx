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

  const fullLetterText = `Dear Hiring Director,

Over the past 5 years, I scaled high-impact cross-functional initiatives delivering 45% faster execution, ₹3.2 Cr in operational revenue optimization, and verified SLA performance.

I would welcome the opportunity to bring this strategic focus to your organization.`;

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
      name: "Modern Linear",
      desc: "Clean single-column layout preferred by enterprise screeners at Fortune 500 companies.",
    },
    {
      id: "harvard",
      name: "Harvard Classic",
      desc: "Formal serif typographic hierarchy for corporate leadership roles.",
    },
    {
      id: "executive",
      name: "Executive High-Impact",
      desc: "High information density focused strictly on quantifiable business outcomes and revenue scale.",
    },
  ];

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  return (
    <section id="features" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Precision Engine
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Calibrated for enterprise hiring standards.
        </h2>
        <p className="text-slate-600 dark:text-[#8c96a8] text-xs sm:text-sm leading-relaxed">
          Screening parsers reward clear single-column structure and quantified metrics.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: ATS Screening Engine (2 cols) */}
        <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1f232e]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#181c25] border border-slate-200 dark:border-[#242b38] flex items-center justify-center text-slate-700 dark:text-[#8c96a8]">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    ATS Diagnostic Simulation
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">Workday, Greenhouse & Lever compliance check</p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                14/14 Rules Passed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mt-5 items-center">
              {/* Circular Gauge */}
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 dark:bg-[#0d0f14] border border-slate-100 dark:border-[#1b1f29]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-slate-200 dark:stroke-[#1e222d]"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      className="stroke-slate-900 dark:stroke-white"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                      {atsScore}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-zinc-500">ATS Rating</span>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                  Top 3% Competitive Percentile
                </p>
              </div>

              {/* Checklist */}
              <div className="sm:col-span-7 space-y-2">
                {[
                  "Standard single-column flow (zero multi-column tables)",
                  "Contact metadata parseable in header block",
                  "Action verbs followed by quantified throughput numbers",
                  "Target role keywords extracted with 96% confidence",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2: 1-Click Bullet Tailor (1 col) */}
        <SpotlightCard className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#1f232e]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#181c25] border border-slate-200 dark:border-[#242b38] flex items-center justify-center text-slate-700 dark:text-[#8c96a8]">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Bullet Point Calibrator
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#161a23] p-0.5 rounded border border-slate-200 dark:border-[#232936] text-[10px] font-mono">
                <button
                  onClick={() => setTailorStep("before")}
                  className={`px-1.5 py-0.5 rounded transition ${
                    tailorStep === "before"
                      ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white font-semibold"
                      : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  Weak
                </button>
                <button
                  onClick={() => setTailorStep("after")}
                  className={`px-1.5 py-0.5 rounded transition ${
                    tailorStep === "after"
                      ? "bg-white dark:bg-[#232936] text-slate-900 dark:text-white font-semibold"
                      : "text-slate-400 dark:text-zinc-500"
                  }`}
                >
                  Calibrated
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-[#0d0f14] border border-slate-100 dark:border-[#1b1f29] min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {tailorStep === "before" ? (
                  <motion.div
                    key="before"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <span className="text-[10px] font-mono uppercase text-rose-500 font-bold block">
                      Passive & Unquantified
                    </span>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-through leading-relaxed">
                      "Responsible for managing daily team deliverables and client project updates."
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="after"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
                  >
                    <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                      Recruiter-Approved (+44% Impact)
                    </span>
                    <p className="text-xs text-slate-900 dark:text-zinc-100 font-medium leading-relaxed">
                      "Directed cross-functional execution across 18 enterprise deliverables, cutting turnaround by 42% while sustaining 99.4% SLA adherence."
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Executive Cover Letter (1 col) */}
        <SpotlightCard className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 dark:border-[#1f232e]">
              <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#181c25] border border-slate-200 dark:border-[#242b38] flex items-center justify-center text-slate-700 dark:text-[#8c96a8]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Executive Outreach Drafter
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Streamlined tailored note</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-[#0a0c10] border border-slate-100 dark:border-[#1a1e28] font-mono text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed min-h-[150px]">
              <span className="whitespace-pre-wrap">{displayedText}</span>
              <span className="inline-block w-1.5 h-3.5 bg-slate-900 dark:bg-white ml-0.5 animate-pulse" />
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4: ATS Layouts (2 cols) */}
        <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 dark:border-[#1f232e]">
              <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#181c25] border border-slate-200 dark:border-[#242b38] flex items-center justify-center text-slate-700 dark:text-[#8c96a8]">
                <LayoutTemplate className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Tested Single-Column Templates
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Parsed across enterprise screeners</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id as any)}
                  className={`p-3 rounded-lg border transition cursor-pointer ${
                    activeTemplate === tpl.id
                      ? "border-slate-400 dark:border-zinc-600 bg-slate-100 dark:bg-[#161a23]"
                      : "border-slate-200 dark:border-[#1b1f29] bg-slate-50 dark:bg-[#0d0f14] hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{tpl.name}</span>
                    {activeTemplate === tpl.id && (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

      </div>
    </section>
  );
}
