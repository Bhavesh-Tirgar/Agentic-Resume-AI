"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check, Briefcase, TrendingUp, DollarSign, Layers } from "lucide-react";

type ShowcaseIndustry = "tech" | "sales" | "finance" | "marketing";

interface ShowcaseData {
  label: string;
  role: string;
  beforeBullet: string;
  beforeScore: number;
  beforeFlaws: string[];
  afterBullet: string;
  afterScore: number;
  afterWins: string[];
}

const SHOWCASE_DATA: Record<ShowcaseIndustry, ShowcaseData> = {
  tech: {
    label: "Tech & Engineering",
    role: "Senior Cloud & Systems Engineer",
    beforeBullet: "Responsible for building backend features in Python and Django for our web application. Handled bug fixes, database changes, and worked with the team to deploy releases.",
    beforeScore: 41,
    beforeFlaws: [
      "Passive phrasing ('Responsible for', 'Handled')",
      "Zero scale metrics (RPS, concurrency, latency, or throughput)"
    ],
    afterBullet: "Architected 14+ high-throughput endpoints using Python, Django REST Framework, and Redis, driving a 42% decrease in p99 API latency while supporting 25,000+ daily active users.",
    afterScore: 98,
    afterWins: [
      "High-impact action verb ('Architected 14+ high-throughput endpoints')",
      "Verified outcome: 42% latency cut across 25,000+ active users"
    ]
  },
  sales: {
    label: "Sales & Revenue",
    role: "Enterprise B2B Account Executive",
    beforeBullet: "Managed sales leads, delivered client demos, and worked closely with prospect accounts to close new software subscription deals every quarter.",
    beforeScore: 38,
    beforeFlaws: [
      "Routine activity list without quota benchmarks or revenue scale",
      "No measurable deal velocity, contract size, or pipeline growth"
    ],
    afterBullet: "Generated $3.4M in net new enterprise ARR across 24 accounts, exceeding annual target quota by 138% and reducing average sales cycle from 90 to 52 days.",
    afterScore: 96,
    afterWins: [
      "Explicit top-line business impact ($3.4M ARR expansion)",
      "High-signal recruiter metrics: 138% quota attainment and 42% faster cycle"
    ]
  },
  finance: {
    label: "Finance & Accounting",
    role: "Senior Financial Analyst & Controller",
    beforeBullet: "Handled company accounting entries, prepared monthly financial statements, assisted with audits, and reconciled departmental expense accounts.",
    beforeScore: 44,
    beforeFlaws: [
      "Passive task summary with zero audit scope or cost efficiency metrics",
      "Lacks governance scale or executive decision-making impact"
    ],
    afterBullet: "Directed quarterly financial reconciliation across $42M in multi-entity corporate assets with zero discrepancies, identifying and eliminating $1.2M in recurring vendor overhead.",
    afterScore: 97,
    afterWins: [
      "Asset scale defined ($42M portfolio under governance)",
      "Quantifiable P&L contribution: $1.2M in validated operational savings"
    ]
  },
  marketing: {
    label: "Marketing & Growth",
    role: "Growth Marketing Director",
    beforeBullet: "Managed social media marketing campaigns, created ad copy, oversaw the monthly advertising budget, and tracked Google Analytics conversions.",
    beforeScore: 40,
    beforeFlaws: [
      "Vague operational duties without acquisition efficiency or return on ad spend",
      "Missing conversion funnels, CAC metrics, or revenue attribution"
    ],
    afterBullet: "Scaled omni-channel acquisition funnels generating 14,000+ qualified leads, reducing blended Customer Acquisition Cost (CAC) by 32% while managing ₹60L annual paid spend.",
    afterScore: 95,
    afterWins: [
      "Clear acquisition funnel volume (14,000+ verified MQLs)",
      "Direct efficiency proof: 32% CAC reduction with full attribution"
    ]
  }
};

export function BeforeAfterShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseIndustry>("tech");
  const [copied, setCopied] = useState(false);

  const current = SHOWCASE_DATA[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.afterBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Universal Impact Calibration
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          The difference one bullet makes.
        </h2>
        <p className="text-slate-600 dark:text-[#8c96a8] text-xs sm:text-sm leading-relaxed">
          Recruiters and ATS filters discard passive task checklists. They reward quantifiable scale, revenue growth, and verifiable outcomes across every career discipline.
        </p>

        {/* Industry Selector Tabs */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
          {(["tech", "sales", "finance", "marketing"] as ShowcaseIndustry[]).map((ind) => (
            <button
              key={ind}
              onClick={() => setActiveTab(ind)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === ind
                  ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#151820] dark:text-[#8c96a8] dark:hover:bg-[#1e2330]"
              }`}
            >
              {SHOWCASE_DATA[ind].label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Pill */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#151922] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-[#222836]">
          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
          <span>Calibrating for: <strong>{current.role}</strong></span>
        </span>
      </div>

      {/* Dual-Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        
        {/* Card 1: Before (Rejected) */}
        <div className="rounded-xl bg-white dark:bg-[#111318] border border-rose-200 dark:border-[#3b1d22] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-[#231d20]">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Passive Task Draft
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-[#251417] text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-[#421d23] font-semibold">
              ATS Score: {current.beforeScore}/100
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
              "{current.beforeBullet}"
            </p>

            <div className="pt-3 border-t border-rose-100 dark:border-[#1e1c22] space-y-1.5 text-xs text-rose-600 dark:text-[#fca5a5]">
              {current.beforeFlaws.map((flaw, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>{flaw}</span>
                </div>
              ))}
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
                ATS Score: {current.afterScore}/100
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
            <p className="text-xs text-slate-900 dark:text-zinc-100 font-medium leading-relaxed font-sans">
              "{current.afterBullet}"
            </p>

            <div className="pt-3 border-t border-emerald-100 dark:border-[#16241b] space-y-1.5 text-xs text-emerald-700 dark:text-[#86efac]">
              {current.afterWins.map((win, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{win}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
