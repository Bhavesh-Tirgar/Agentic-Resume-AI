"use client";

import React, { useState } from "react";
import { ArrowLeftRight, CheckCircle2, XCircle, Sparkles, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export function BeforeAfterShowcase() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [copied, setCopied] = useState(false);

  const beforeBullet = "Responsible for building backend features in Python and Django for our web application. Handled bug fixes, database changes, and worked with the frontend team to deploy releases.";
  const afterBullet = "Architected 14+ high-throughput microservices using Python, Django REST Framework, and Redis, driving a 42% decrease in p99 API latency while supporting 25,000+ daily active users.";

  const handleCopy = () => {
    navigator.clipboard.writeText(afterBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Interactive Comparative Audit</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white">
          See How AI Transforms Rejections into Interviews
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Slide across to inspect the structural transformation from a passive, unquantified statement into an executive-tier, recruiter-grade accomplishment.
        </p>
      </div>

      {/* Interactive Dual-Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Card 1: Before AI (Rejected) */}
        <div className="rounded-2xl bg-zinc-950/80 border border-rose-500/30 p-6 backdrop-blur-xl relative overflow-hidden shadow-[0_8px_32px_0_rgba(244,63,94,0.1)]">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">
                Before AI (Rejected by ATS Screener)
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              ATS Score: 41/100
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-zinc-400 leading-relaxed font-mono">
              "{beforeBullet}"
            </p>

            <div className="pt-3 border-t border-zinc-900 space-y-1.5 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Passive phrasing ("Responsible for", "Handled")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Zero quantifiable business or latency outcomes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Fails ATS keyword density checks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: After AI (Hired) */}
        <div className="rounded-2xl bg-zinc-950/80 border border-emerald-500/40 p-6 backdrop-blur-xl relative overflow-hidden shadow-[0_8px_32px_0_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                After AI (Hired by Tier-1 Tech)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ATS Score: 98/100
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-sm text-zinc-100 font-medium leading-relaxed font-mono">
              "{afterBullet}"
            </p>

            <div className="pt-3 border-t border-zinc-900 space-y-1.5 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active executive action verbs ("Architected", "Driving")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Quantified engineering throughput (14+ services, 42% latency cut, 25k DAU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>High-value ATS keyword stack: Redis, Django REST, Microservices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
