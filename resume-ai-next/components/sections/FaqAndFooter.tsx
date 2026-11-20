"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function FaqAndFooter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the ATS diagnostic simulate Workday & Lever?",
      a: "Our backend uses PyMuPDF to test single-column linear parsing, font encoding, and metadata isolation against standard enterprise parsing schemas.",
    },
    {
      q: "Is my resume used for AI training?",
      a: "No. Uploads are processed in ephemeral memory with zero model fine-tuning retention. Your candidate data remains private.",
    },
    {
      q: "Why do you recommend single-column formats?",
      a: "Multi-column tables and text boxes frequently scramble text order in legacy screeners, turning dates and skills into unparseable blocks.",
    },
    {
      q: "Can I use this without an account?",
      a: "Yes. The ATS Diagnostic and sample job matching run instantly in your browser without registration.",
    },
  ];

  return (
    <>
      {/* FAQ Section */}
      <section id="faq" className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-[#8c96a8] text-xs sm:text-sm">
            Everything you need to know about ATS scoring and privacy.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-[#1a1f2b] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Contrast Executive Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1a1e27] bg-slate-50 dark:bg-[#07080a] py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold text-[10px]">
              RA
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Resume AI</span>
            <span>•</span>
            <span className="font-mono text-[11px]">Engineering Career Copilot</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition">
              GitHub Repo
            </a>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">Multi-Agent LangGraph System</span>
          </div>
        </div>
      </footer>
    </>
  );
}
