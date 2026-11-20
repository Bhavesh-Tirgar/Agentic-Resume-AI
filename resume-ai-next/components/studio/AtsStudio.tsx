"use client";

import React, { useState, useRef } from "react";
import { 
  CheckCircle2, AlertTriangle, Copy, Check, Target, 
  HelpCircle, Layers, Building2, UploadCloud, FileText, 
  ArrowRight, Sparkles, RefreshCw
} from "lucide-react";
import { AtsResultData, INITIAL_DOSSIER } from "@/lib/demoData";
import { useTheme } from "../ThemeProvider";

interface AtsStudioProps {
  onNavigateToMatch?: () => void;
  onNavigateToInterview?: () => void;
}

export function AtsStudio({ onNavigateToMatch, onNavigateToInterview }: AtsStudioProps) {
  const [data, setData] = useState<AtsResultData>(INITIAL_DOSSIER);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"rewrites" | "strengths" | "gaps">("rewrites");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    // Simulate real parsing & scoring with high-frequency feedback
    setTimeout(() => {
      setIsScanning(false);
      setData({
        ...INITIAL_DOSSIER,
        score_data: {
          ...INITIAL_DOSSIER.score_data,
          overall_score: 93,
          grade: "Tier-1 Exceptional",
          percentile: "Top 3% of Technical Candidates"
        }
      });
    }, 1200);
  };

  const { score_data, analysis_data, parsed_data } = data;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Dossier Header Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Verified Technical Dossier
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {parsed_data.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {parsed_data.title} • {parsed_data.location}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New PDF</span>
              </>
            )}
          </button>

          {onNavigateToMatch && (
            <button
              onClick={onNavigateToMatch}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#262c3b] bg-slate-100 dark:bg-[#191d27] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#232936] transition cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Match Job</span>
            </button>
          )}

          {onNavigateToInterview && (
            <button
              onClick={onNavigateToInterview}
              className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#262c3b] bg-slate-100 dark:bg-[#191d27] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#232936] transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Interview Deck</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Parsed Technical Dossier (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Extracted Technical Competencies */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>Extracted Technical Competencies</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {parsed_data.skills.languages.length + parsed_data.skills.frameworks.length + parsed_data.skills.databases.length} Keywords Parsed
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase font-mono block mb-1.5">
                  Languages & Core
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed_data.skills.languages.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#171b24] border border-slate-200 dark:border-[#232936] text-slate-700 dark:text-zinc-300 font-mono text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase font-mono block mb-1.5">
                  Frameworks & Multi-Agent AI
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed_data.skills.frameworks.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#171b24] border border-slate-200 dark:border-[#232936] text-slate-700 dark:text-zinc-300 font-mono text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase font-mono block mb-1.5">
                  Database & Infrastructure
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[...parsed_data.skills.databases, ...parsed_data.skills.devops].map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#171b24] border border-slate-200 dark:border-[#232936] text-slate-700 dark:text-zinc-300 font-mono text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Experience Timeline with In-line Audit Flags */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Production Experience & Bullet Verification</span>
            </h2>

            <div className="space-y-6">
              {parsed_data.experience.map((exp, idx) => (
                <div key={idx} className="pb-6 border-b border-slate-100 dark:border-[#1b1f2b] last:border-b-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{exp.role}</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{exp.organization} • {exp.location}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-[#151922] px-2 py-0.5 rounded border border-slate-200 dark:border-[#202533] self-start sm:self-auto">
                      {exp.duration}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2.5">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Credentials */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Verified Academic Credentials
            </h2>
            {parsed_data.education.map((edu, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{edu.degree}</p>
                  <p className="text-slate-500 dark:text-zinc-400 mt-0.5">{edu.institution} • {edu.grade}</p>
                </div>
                <span className="font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-[#151922] px-2 py-0.5 rounded border border-slate-200 dark:border-[#202533]">
                  {edu.year}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: ATS Recruiter Scorecard & Rewriter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Overall ATS Diagnostic Card */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Recruiter Audit Score
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {score_data.grade}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {score_data.overall_score}
              </span>
              <span className="text-sm font-mono text-slate-400 dark:text-zinc-500">/ 100</span>
              <span className="ml-auto text-xs font-mono text-slate-500 dark:text-zinc-400">
                {score_data.percentile}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-5">
              {score_data.summary}
            </p>

            {/* Category Score Meters */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#1e2330]">
              {score_data.categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">{cat.name}</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{cat.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1a1f2c] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-700" 
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Bullet Point Rewriter */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Strategic Bullet Point Diff</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                1-Click Copy
              </span>
            </div>

            <div className="space-y-4">
              {analysis_data.bullet_rewrites.map((rw, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-[#1e2330] bg-slate-50 dark:bg-[#0e1015] space-y-2.5 text-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-500 font-semibold block mb-0.5">
                      Weak / Passive Original
                    </span>
                    <p className="text-slate-500 dark:text-zinc-400 line-through leading-relaxed">
                      "{rw.original}"
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                        Calibrated Rewrite (Impact-Driven)
                      </span>
                      <button
                        onClick={() => handleCopy(rw.rewritten, idx)}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-900 dark:text-zinc-100 font-medium leading-relaxed bg-white dark:bg-[#161a23] p-2.5 rounded border border-slate-200 dark:border-[#232936]">
                      "{rw.rewritten}"
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">
                    Reason: {rw.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Immediate Improvements */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-[#1e2330] pb-2">
              <button
                onClick={() => setActiveTab("rewrites")}
                className={`text-xs font-semibold uppercase tracking-wider pb-1 transition-colors ${
                  activeTab === "rewrites" 
                    ? "text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white" 
                    : "text-slate-400 dark:text-zinc-500"
                }`}
              >
                Key Strengths
              </button>
              <button
                onClick={() => setActiveTab("gaps")}
                className={`text-xs font-semibold uppercase tracking-wider pb-1 ml-3 transition-colors ${
                  activeTab === "gaps" 
                    ? "text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white" 
                    : "text-slate-400 dark:text-zinc-500"
                }`}
              >
                Recruiter Gaps
              </button>
            </div>

            {activeTab === "rewrites" ? (
              <ul className="space-y-2 text-xs">
                {analysis_data.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 text-xs">
                {analysis_data.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
