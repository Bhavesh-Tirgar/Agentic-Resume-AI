"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

interface PricingMatrixProps {
  onScanClick?: () => void;
  onOpenStudio?: () => void;
  onSelectPlan?: (planName: string) => void;
}

export function PricingMatrix({ onScanClick, onOpenStudio, onSelectPlan }: PricingMatrixProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "lifetime">("monthly");
  const [activePlanNotice, setActivePlanNotice] = useState<string | null>(null);

  const handlePlanClick = (planName: string) => {
    if (planName === "Free Diagnostic") {
      if (onScanClick) onScanClick();
      else if (typeof window !== "undefined") window.location.hash = "scanner";
    } else {
      setActivePlanNotice(`✨ Free Beta Preview Active: ${planName} unlocked without payment. Launching Studio...`);
      onSelectPlan?.(planName);
      if (onOpenStudio) {
        setTimeout(onOpenStudio, 1200);
      }
    }
  };

  const plans = [
    {
      name: "Free Diagnostic",
      price: "$0",
      cadence: "forever free",
      description: "Basic single-column ATS verification and top keyword check.",
      features: [
        "1 PDF resume evaluation",
        "Overall ATS score (0-100)",
        "Missing keyword detection",
        "Plain-text export",
      ],
      cta: "Run Free Scan",
      highlighted: false,
    },
    {
      name: "Career Pro",
      price: billingCycle === "monthly" ? "$19" : "$89",
      cadence: billingCycle === "monthly" ? "/month" : "one-time",
      description: "Full AI career intelligence suite for active job search cycles.",
      features: [
        "Unlimited resume scans & revisions",
        "1-Click quantifiable bullet rewriter",
        "Job description match & gap audit",
        "STAR interview question preparation",
        "Harvard & Modern Executive ATS formats",
      ],
      cta: "Get Pro Access",
      highlighted: true,
      badge: "Recommended",
    },
    {
      name: "Executive Suite",
      price: "$149",
      cadence: "one-time",
      description: "Lifetime career intelligence for leaders and professionals.",
      features: [
        "All Career Pro capabilities forever",
        "Executive cover letter generator",
        "Instant high-priority AI processing",
        "Lifetime platform updates & exports",
      ],
      cta: "Get Lifetime Access",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Transparent Pricing
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Straightforward pricing.
        </h2>
        <p className="text-slate-600 dark:text-[#8c96a8] text-xs sm:text-sm">
          Run your diagnostic free. Upgrade when actively preparing for interviews.
        </p>

        {activePlanNotice && (
          <div className="p-3 my-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-400 animate-fadeIn">
            {activePlanNotice}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <div className="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-[#111318] border border-slate-200 dark:border-[#20242e] text-xs font-medium">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-[#1a1e27] text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("lifetime")}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                billingCycle === "lifetime"
                  ? "bg-white dark:bg-[#1a1e27] text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              Lifetime (Save 40%)
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-5 flex flex-col justify-between transition-all ${
              p.highlighted
                ? "border-2 border-slate-900 dark:border-white bg-white dark:bg-[#111318] shadow-lg relative"
                : "border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] shadow-xs"
            }`}
          >
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-wider">
                {p.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{p.price}</span>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">{p.cadence}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">{p.description}</p>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1a1f2b] space-y-2 mb-6">
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handlePlanClick(p.name)}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                p.highlighted
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-sm active:scale-95"
                  : "bg-slate-100 dark:bg-[#181c25] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#202633] border border-slate-200 dark:border-[#232a38] active:scale-95"
              }`}
            >
              <span>{p.cta}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
