"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, ShieldCheck, Zap, Copy, Check, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AtsScannerSection() {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: "Binary Parsing & Magic Bytes", desc: "Validating header %PDF-1.4 and extracting text layer" },
    { title: "Semantic Entity Extractor", desc: "Structuring skills, experience bullets, and education" },
    { title: "ATS Screener Engine", desc: "Benchmarking against Workday & Taleo algorithm schemas" },
    { title: "Executive Bullet Optimizer", desc: "Injecting quantified impact metrics and action verbs" },
  ];

  const handleStartScan = async () => {
    setScanning(true);
    setHasScanned(false);
    setActiveStep(0);

    for (let i = 0; i < steps.length; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 550));
    }

    setScanning(false);
    setHasScanned(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="scanner" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Interactive Diagnostic</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Live ATS Resume Scanner
        </h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Drop your resume PDF or run our instant demonstration to evaluate compatibility across automated hiring screeners.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800 p-8 text-center backdrop-blur-xl shadow-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleStartScan}
          className="hidden"
        />

        {!scanning && !hasScanned && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleStartScan(); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-950/20"
                : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
              <UploadCloud className="w-7 h-7 text-emerald-400" />
            </div>

            <p className="text-sm font-semibold text-white">
              Drag & drop your PDF resume here, or <span className="text-emerald-400 underline">browse files</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports standard single/multi-column PDFs up to 5MB
            </p>

            <div className="mt-6 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Retention • Ephemeral Parsing Only</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartScan();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Demo: Test Alex Rivera Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Scanning Progress */}
        {scanning && (
          <div className="py-6 text-left max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Analyzing Document...
              </span>
              <span className="text-xs font-mono text-zinc-500">Step {activeStep + 1} of 4</span>
            </div>

            <div className="space-y-2">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    i === activeStep
                      ? "bg-zinc-900 border-emerald-500 text-white"
                      : i < activeStep
                      ? "bg-zinc-950 border-zinc-800 text-zinc-400"
                      : "bg-zinc-950 border-transparent text-zinc-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{st.title}</span>
                    {i < activeStep && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {i === activeStep && <span className="text-[10px] font-mono text-emerald-400">Processing...</span>}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Results View */}
        {hasScanned && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Evaluation Complete • Candidate: Alex Rivera
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Senior Distributed Systems Engineer</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                  <span className="text-3xl font-black">98</span>
                  <span className="text-xs">/100</span>
                </div>

                <button
                  onClick={() => setHasScanned(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Matched High-Value Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    Kubernetes (+24%)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    Distributed Systems
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    Kafka Pipelines
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                    p99 Latency Tuning
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Recruiter Action Item:</span>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Add 1 explicit reference to cloud infrastructure-as-code (Terraform or CloudFormation) to qualify for 100% of Staff-level postings.
                </p>
              </div>
            </div>

            {/* AI Bullet Rewrite Highlight */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  Recommended Bullet Point Rewrite:
                </span>
                <button
                  onClick={() => handleCopy("Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually.")}
                  className="flex items-center gap-1 font-mono text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Rewrite"}</span>
                </button>
              </div>
              <p className="text-zinc-200 font-medium font-mono text-[11px] leading-relaxed">
                "Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually."
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
