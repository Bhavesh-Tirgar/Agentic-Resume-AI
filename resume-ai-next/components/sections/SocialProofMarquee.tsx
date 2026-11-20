"use client";

import React from "react";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { TrendingUp, Award } from "lucide-react";

export function SocialProofMarquee() {
  const marqueeItems = [
    { name: "Google", role: "L5 Senior SWE", salary: "+48% Comp" },
    { name: "Meta", role: "Staff Systems Eng", salary: "+52% Comp" },
    { name: "Apple", role: "AI Infrastructure", salary: "+40% Comp" },
    { name: "Stripe", role: "Backend Platform", salary: "+45% Comp" },
    { name: "Microsoft", role: "Principal Architect", salary: "+38% Comp" },
    { name: "OpenAI", role: "Member of Tech Staff", salary: "+60% Comp" },
    { name: "Amazon", role: "Senior Solutions", salary: "+35% Comp" },
    { name: "Netflix", role: "Core Distributed", salary: "+44% Comp" },
  ];

  return (
    <section className="relative py-6 border-y border-slate-200 dark:border-[#1a1e27] bg-slate-50 dark:bg-[#0c0e13] overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-[#626b79]">
            Recent Candidate Placements
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-[#8c96a8] font-mono">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-900 dark:text-white font-semibold">+42%</span>
            <span>Avg. Compensation Bump</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span className="text-slate-900 dark:text-white font-semibold">94.2%</span>
            <span>ATS Screener Pass Rate</span>
          </div>
        </div>
      </div>

      <InfiniteMarquee items={marqueeItems} speed={36} />
    </section>
  );
}
