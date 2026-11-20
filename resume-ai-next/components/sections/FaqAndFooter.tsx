"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, Shield, ArrowRight, Code2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FaqAndFooter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Resume AI simulate real enterprise ATS scanners (Workday, Taleo, Greenhouse)?",
      a: "Our backend uses binary PyMuPDF parser emulation to verify that section tags, linear tab orders, and headings pass without font substitution or glyph distortion. We then run semantic cross-matching against the exact taxonomy databases used by major enterprise applicant tracking systems.",
    },
    {
      q: "Is my personal resume data private and protected?",
      a: "Yes, completely. We enforce a zero-retention privacy policy. Resumes uploaded for diagnostics are parsed in ephemeral memory, sanitized, and never used to train public LLM models. Your contact information and employment history remain 100% confidential.",
    },
    {
      q: "Can I export in both PDF and Microsoft Word (.docx)?",
      a: "Yes. Both formats are generated with single-column linear tables and system fonts (Inter, Arial, Georgia) guaranteed to parse cleanly through automated screeners without encoding errors.",
    },
    {
      q: "How does the 1-Click Job Tailor feature work?",
      a: "Simply paste the target job posting URL or description. Our JobMatchingAgent scans the description for must-have technical skills and missing soft skills, then suggests customized bullet points emphasizing your relevant experience for that exact role.",
    },
    {
      q: "What is the difference between free and Pro Career?",
      a: "The free tier gives you an overall ATS score and high-level feedback. Pro Career unlocks the full multi-agent suite: unlimited job description matching, our 1-click metric-driven bullet rewriter, Harvard templates, and technical interview simulations.",
    },
  ];

  return (
    <>
      {/* FAQ Section */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Everything You Need to Know
          </h2>
          <p className="text-zinc-400 text-sm">
            Honest answers about ATS compliance, data privacy, and career acceleration.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-semibold text-white cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <div className="text-zinc-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bold High-Conversion CTA Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-tr from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-500/40 p-8 sm:p-14 text-center overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.2)]">
          {/* Ambient Inner Glow */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/25 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Land Your Dream Role?
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Scan your resume in 60 seconds. Eliminate ATS blind spots, highlight your strongest metrics, and start booking interviews.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#scanner"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-black bg-white hover:bg-zinc-200 shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Upload Resume & Scan Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <p className="text-[11px] text-zinc-400 font-mono pt-2">
              No credit card required • Instant automated ATS diagnostic
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/90 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
              RA
            </div>
            <span className="font-bold text-white text-sm">ResumeAI</span>
            <span>•</span>
            <span>MotionSites.ai Design & React Bits Component Architecture</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#scanner" className="hover:text-white transition">ATS Scanner</a>
            <a href="#features" className="hover:text-white transition">Bento Box</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a
              href="https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 font-mono">
          <span>© 2026 ResumeAI. All rights reserved.</span>
          <span>Engineered with Next.js 14 App Router, TypeScript, Tailwind CSS & Framer Motion.</span>
        </div>
      </footer>
    </>
  );
}
