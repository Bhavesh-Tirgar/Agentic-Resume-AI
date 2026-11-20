"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowRight, Code2 } from "lucide-react";
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
      <section id="faq" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#626b79]">
            Questions & Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-[#8c96a8] text-sm">
            Everything you need to know about ATS compliance, data privacy, and career acceleration.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-[#20242e] bg-[#111318] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-semibold text-white cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <div className="text-[#626b79] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4 pt-0 text-xs text-[#8c96a8] leading-relaxed border-t border-[#1b1f29]">
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

      {/* High-Conversion CTA Banner */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-2xl bg-[#141720] border border-[#232936] p-8 sm:p-12 text-center shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Ready to Land Your Dream Role?
            </h2>
            <p className="text-[#8c96a8] text-sm sm:text-base leading-relaxed">
              Scan your resume in 60 seconds. Eliminate ATS blind spots, highlight your strongest metrics, and start booking interviews.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#scanner"
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-xs text-black bg-white hover:bg-[#e4e7eb] shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Upload Resume & Scan Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-[#626b79] font-mono pt-1">
              No credit card required • Instant automated ATS diagnostic
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#181c25] bg-[#0c0e13] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#626b79]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white text-black font-bold text-xs flex items-center justify-center">
              RA
            </div>
            <span className="font-bold text-white text-sm">ResumeAI</span>
            <span>•</span>
            <span>Executive AI Resume Builder & Real-Time ATS Scanner</span>
          </div>

          <div className="flex items-center gap-6 text-[#8c96a8]">
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

        <div className="max-w-7xl mx-auto mt-5 pt-5 border-t border-[#181c25] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#525966] font-mono">
          <span>© 2026 ResumeAI. All rights reserved.</span>
          <span>Engineered with Next.js 14 App Router, TypeScript, Tailwind CSS & Framer Motion.</span>
        </div>
      </footer>
    </>
  );
}
