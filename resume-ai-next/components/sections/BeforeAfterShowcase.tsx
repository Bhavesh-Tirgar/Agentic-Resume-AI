"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check } from "lucide-react";

export function BeforeAfterShowcase() {
  const [copied, setCopied] = useState(false);

  const beforeBullet = "Responsible for building backend features in Python and Django for our web application. Handled bug fixes, database changes, and worked with the team to deploy releases.";
  const afterBullet = "Architected 14+ high-throughput endpoints using Python, Django REST Framework, and Redis, driving a 42% decrease in p99 API latency while supporting 25,000+ daily active users.";

  const handleCopy = () => {
    navigator.clipboard.writeText(afterBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Comparative Audit
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          The difference one bullet makes.
        </h2>
        <p className="text-slate-600 dark:text-[#8c96a8] text-xs sm:text-sm leading-relaxed">
          Screeners filter out passive task lists. They reward quantifiable scale, revenue growth, and concrete business outcomes across every role.
        </p>
      </div>

      {/* Dual-Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        
        {/* Card 1: Before (Rejected) */}
        <div className="rounded-xl bg-white dark:bg-[#111318] border border-rose-200 dark:border-[#3b1d22] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-[#231d20]">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Passive Draft
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-[#251417] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-[#421d23] font-semibold">
              ATS Score: 41/100
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-mono">
              "{beforeBullet}"
            </p>

            <div className="pt-3 border-t border-rose-100 dark:border-[#1e1c22] space-y-1.5 text-xs text-rose-600 dark:text-[#fca5a5]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Passive phrasing ("Responsible for", "Handled")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Zero scale metrics (RPS, users, latency, or throughput)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: After (Calibrated) */}
        <div className="rounded-xl bg-white dark:bg-[#111318] border border-emerald-200 dark:border-[#1e3c27] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-[#192b1f]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Recruiter-Approved
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#132418] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-[#1c4026] font-semibold">
                ATS Score: 98/100
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title="Copy calibrated bullet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-900 dark:text-zinc-100 font-medium leading-relaxed font-mono">
              "{afterBullet}"
            </p>

            <div className="pt-3 border-t border-emerald-100 dark:border-[#16241b] space-y-1.5 text-xs text-emerald-700 dark:text-[#86efac]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active action verb ("Architected 14+ microservices")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Verified impact: 42% latency cut across 25,000 DAU</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
