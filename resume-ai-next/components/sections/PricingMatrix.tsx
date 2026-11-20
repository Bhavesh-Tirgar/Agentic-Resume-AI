"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function PricingMatrix() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "lifetime">("monthly");

  const plans = [
    {
      name: "Free Scan",
      price: "$0",
      cadence: "forever free",
      description: "Essential ATS diagnostic report to check single-column readability and top keyword errors.",
      features: [
        "1 Resume PDF Ingestion",
        "Overall ATS Compatibility Score (0-100)",
        "Basic Missing Keyword Flags",
        "Single-Column Plain Text Export",
      ],
      cta: "Start Free Scan",
      highlighted: false,
    },
    {
      name: "Pro Career",
      price: billingCycle === "monthly" ? "$19" : "$99",
      cadence: billingCycle === "monthly" ? "/month" : "one-time",
      description: "Our flagship multi-agent workflow: unlimited job matching, bullet rewrites, and Harvard templates.",
      features: [
        "Unlimited PDF & LinkedIn Ingestions",
        "Deep LangGraph Recruiter Analysis",
        "1-Click Bullet Point Rewriter (Quantified Metrics)",
        "Targeted Job Description Matcher",
        "STAR Interview Question Simulator",
        "All 3 ATS Master Templates (PDF & DOCX)",
        "Zero-Retention Privacy Guarantee",
      ],
      cta: "Upgrade to Pro Career",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Executive Lifetime",
      price: "$149",
      cadence: "lifetime access",
      description: "For senior leaders, staff engineers, and executives demanding personalized resume architecture.",
      features: [
        "Lifetime Access to All Pro Capabilities",
        "Executive Cover Letter Streamer",
        "Priority LLM Routing (Gemini 2.5 Flash)",
        "Direct LinkedIn Bio & Portfolio Alignment",
        "Continuous Future Updates & Early Access",
      ],
      cta: "Get Lifetime Access",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Transparent Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.03em] text-white">
          Invest in Interviews, Not Endless Applications
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          One optimized resume pays for itself in your very first offer negotiation. Cancel anytime.
        </p>

        {/* Billing Switch */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <div className="flex items-center p-1 rounded-full bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("lifetime")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "lifetime"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Lifetime Deal</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Save 40%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 ${
              plan.highlighted
                ? "bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.2)] lg:-translate-y-2"
                : "bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold font-mono tracking-wider uppercase shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{plan.badge}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight">{plan.name}</h3>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white font-mono">{plan.price}</span>
                <span className="text-xs text-zinc-500 font-mono">{plan.cadence}</span>
              </div>

              <p className="mt-3 text-xs text-zinc-400 leading-relaxed min-h-[40px]">
                {plan.description}
              </p>

              <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-3">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                  Included Capabilities:
                </span>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`mt-8 w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                plan.highlighted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white"
              }`}
            >
              <span>{plan.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
