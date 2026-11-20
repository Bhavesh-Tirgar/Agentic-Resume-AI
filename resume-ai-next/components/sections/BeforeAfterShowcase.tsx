"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Copy, Check } from "lucide-react";

export function BeforeAfterShowcase() {
  const [copied, setCopied] = useState(false);

  const beforeBullet = "Responsible for building backend features in Python and Django for our web application. Handled bug fixes, database changes, and worked with the frontend team to deploy releases.";
  const afterBullet = "Architected 14+ high-throughput microservices using Python, Django REST Framework, and Redis, driving a 42% decrease in p99 API latency while supporting 25,000+ daily active users.";

  const handleCopy = () => {
    navigator.clipboard.writeText(afterBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="showcase" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-[#626b79]">
          Comparative Audit
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          See How AI Transforms Rejections into Interviews
        </h2>
        <p className="text-[#8c96a8] text-sm sm:text-base leading-relaxed">
          Inspect the structural transformation from a passive statement into an executive-tier, recruiter-grade achievement.
        </p>
      </div>

      {/* Dual-Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        
        {/* Card 1: Before AI (Rejected) */}
        <div className="rounded-xl bg-[#111318] border border-[#3b1d22] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#231d20]">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">
                Before AI (Rejected by Screener)
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#251417] text-rose-400 border border-[#421d23] font-semibold">
              Score: 41/100
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#8c96a8] leading-relaxed font-mono">
              "{beforeBullet}"
            </p>

            <div className="pt-3 border-t border-[#1e1c22] space-y-1.5 text-xs text-[#fca5a5]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Passive phrasing ("Responsible for", "Handled")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Zero quantifiable throughput or latency metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Fails core ATS keyword density checks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: After AI (Hired) */}
        <div className="rounded-xl bg-[#111318] border border-[#1e3824] p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#1b2b20]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
              <span className="text-xs font-bold font-mono text-[#4ade80] uppercase tracking-wider">
                After AI (Hired by Tier-1 Tech)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#132017] text-[#4ade80] border border-[#1e3c25] font-semibold">
                Score: 98/100
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#181c25] text-zinc-300 hover:text-white border border-[#262c3b] transition cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-xs text-white font-medium leading-relaxed font-mono">
              "{afterBullet}"
            </p>

            <div className="pt-3 border-t border-[#18231c] space-y-1.5 text-xs text-[#86efac]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                <span>Active executive action verbs ("Architected", "Driving")</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                <span>Quantified engineering scale (14+ services, 42% latency cut, 25k DAU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                <span>Key technical stack keywords: Redis, Django REST, Microservices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
