"use client";

import React from "react";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { TrendingUp, Users, Award, Shield } from "lucide-react";

export function SocialProofMarquee() {
  const marqueeItems = [
    { name: "Google", role: "L5 Senior SWE", salary: "+48% Salary" },
    { name: "Meta", role: "Staff Systems Eng", salary: "+52% Salary" },
    { name: "Apple", role: "AI Infrastructure", salary: "+40% Salary" },
    { name: "Stripe", role: "Backend Platform", salary: "+45% Salary" },
    { name: "Microsoft", role: "Principal Architect", salary: "+38% Salary" },
    { name: "OpenAI", role: "Member of Tech Staff", salary: "+60% Salary" },
    { name: "Amazon", role: "Senior Solutions", salary: "+35% Salary" },
    { name: "Netflix", role: "Core Distributed", salary: "+44% Salary" },
  ];

  return (
    <section className="relative py-12 border-y border-zinc-800/80 bg-zinc-950/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Candidates Hired at Tier-1 Engineering Orgs
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-semibold">+42%</span>
            <span>Avg. Compensation Bump</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-white font-semibold">94.2%</span>
            <span>ATS Pass Rate</span>
          </div>
        </div>
      </div>

      <InfiniteMarquee items={marqueeItems} speed={32} />
    </section>
  );
}
