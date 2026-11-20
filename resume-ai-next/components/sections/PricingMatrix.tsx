"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

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
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[#626b79]">
          Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Invest in Interviews, Not Endless Applications
        </h2>
        <p className="text-[#8c96a8] text-sm sm:text-base leading-relaxed">
          One optimized resume pays for itself in your very first offer negotiation. Cancel anytime.
        </p>

        {/* Billing Switch */}
        <div className="flex items-center justify-center gap-3 pt-3">
          <div className="flex items-center p-1 rounded-full bg-[#111318] border border-[#20242e]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-[#1f2533] text-white shadow-sm"
                  : "text-[#8c96a8] hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("lifetime")}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "lifetime"
                  ? "bg-[#1f2533] text-white shadow-sm"
                  : "text-[#8c96a8] hover:text-white"
              }`}
            >
              <span>Lifetime Deal</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#132017] text-[#4ade80] border border-[#1e3c25] text-[10px] font-bold">
                Save 40%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-xl p-6 flex flex-col justify-between transition-colors ${
              plan.highlighted
                ? "bg-[#141720] border-2 border-[#384256] shadow-xl"
                : "bg-[#111318] border border-[#20242e] hover:border-[#2b313f]"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-bold font-mono tracking-wider uppercase shadow-sm">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight">{plan.name}</h3>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white font-mono">{plan.price}</span>
                <span className="text-xs text-[#626b79] font-mono">{plan.cadence}</span>
              </div>

              <p className="mt-2 text-xs text-[#8c96a8] leading-relaxed min-h-[36px]">
                {plan.description}
              </p>

              <div className="mt-5 pt-5 border-t border-[#1b1f29] space-y-2.5">
                <span className="text-[10px] font-mono text-[#626b79] uppercase tracking-wider block">
                  Included Capabilities:
                </span>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-[#c4ccd9]">
                    <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`mt-6 w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                plan.highlighted
                  ? "bg-white text-black hover:bg-[#e4e7eb]"
                  : "bg-[#181c25] hover:bg-[#202634] text-white border border-[#252c3c]"
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
