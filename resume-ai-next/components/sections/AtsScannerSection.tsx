"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, CheckCircle2, ShieldCheck, 
  Zap, Copy, Check, RefreshCw 
} from "lucide-react";

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
      await new Promise((r) => setTimeout(r, 450));
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
    <section id="scanner" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="text-center mb-10 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[#626b79]">
          Interactive Diagnostic
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Live ATS Resume Scanner
        </h2>
        <p className="text-[#8c96a8] text-sm max-w-xl mx-auto">
          Drop your resume PDF or run our instant demonstration to evaluate compatibility across automated hiring screeners.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="rounded-xl bg-[#111318] border border-[#20242e] p-8 text-center shadow-lg">
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
            className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${
              dragActive
                ? "border-[#22c55e] bg-[#121c15]"
                : "border-[#242936] hover:border-[#353d50] hover:bg-[#151922]"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-[#181c25] border border-[#242b38] flex items-center justify-center text-[#8c96a8] mx-auto mb-3">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>

            <p className="text-sm font-semibold text-white">
              Drag & drop your PDF resume here, or <span className="text-white underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-[#626b79] mt-1">
              Supports standard single/multi-column PDFs up to 5MB
            </p>

            <div className="mt-6 pt-5 border-t border-[#1b1f29] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626b79]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Zero Data Retention • Ephemeral Parsing Only</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartScan();
                }}
                className="px-3 py-1.5 rounded-md bg-[#181c25] hover:bg-[#202634] text-white font-medium border border-[#252c3c] transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Demo: Test Alex Rivera Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Scanning Progress */}
        {scanning && (
          <div className="py-4 text-left max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                Analyzing Document...
              </span>
              <span className="text-xs font-mono text-[#626b79]">Step {activeStep + 1} of 4</span>
            </div>

            <div className="space-y-2">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-md border text-xs transition-colors ${
                    i === activeStep
                      ? "bg-[#181c25] border-[#384155] text-white"
                      : i < activeStep
                      ? "bg-[#0d0f14] border-[#1c202a] text-[#626b79]"
                      : "bg-[#0d0f14] border-transparent text-[#424855]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{st.title}</span>
                    {i < activeStep && <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />}
                    {i === activeStep && <span className="text-[10px] font-mono text-white">Processing...</span>}
                  </div>
                  <p className="text-[11px] text-[#626b79] mt-0.5">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Results View */}
        {hasScanned && (
          <div className="space-y-5 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#1b1f29]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#4ade80] font-semibold">
                  Evaluation Complete • Candidate: Alex Rivera
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Senior Distributed Systems Engineer</h3>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-lg bg-[#132017] border border-[#1e3c25] text-[#4ade80] font-mono">
                  <span className="text-2xl font-black">98</span>
                  <span className="text-xs">/100</span>
                </div>

                <button
                  onClick={() => setHasScanned(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#181c25] hover:bg-[#202634] text-zinc-300 hover:text-white text-xs font-medium border border-[#252c3c] transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-[#1c202a] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#626b79] block">Matched High-Value Keywords:</span>
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
                    p99 Latency Tuning
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-[#1c202a] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#626b79] block">Recruiter Action Item:</span>
                <p className="text-[#8c96a8] leading-relaxed text-[11px]">
                  Add 1 explicit reference to cloud infrastructure-as-code (Terraform or CloudFormation) to qualify for 100% of Staff-level postings.
                </p>
              </div>
            </div>

            {/* AI Bullet Rewrite Highlight */}
            <div className="p-3.5 rounded-lg bg-[#0d0f14] border border-[#1c202a] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#4ade80] font-semibold">
                  Recommended Bullet Point Rewrite:
                </span>
                <button
                  onClick={() => handleCopy("Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually.")}
                  className="flex items-center gap-1 font-mono text-[#8c96a8] hover:text-white transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Rewrite"}</span>
                </button>
              </div>
              <p className="text-white font-medium font-mono text-[11px] leading-relaxed">
                "Architected event-driven microservices processing 45,000 req/sec with 99.99% uptime, reducing infrastructure compute costs by $180,000 annually."
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
