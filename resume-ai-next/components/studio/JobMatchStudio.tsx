"use client";

import React, { useState } from "react";
import { 
  Target, CheckCircle2, AlertCircle, ArrowRight, 
  Layers, FileText, Check, Sparkles, RefreshCw, HelpCircle
} from "lucide-react";
import { JOB_ROLES_PRESETS, DEMO_JOB_MATCH_RESULT } from "@/lib/demoData";

interface JobMatchStudioProps {
  onStartInterview?: () => void;
}

export function JobMatchStudio({ onStartInterview }: JobMatchStudioProps) {
  const [selectedPreset, setSelectedPreset] = useState(JOB_ROLES_PRESETS[0].id);
  const [jobTitle, setJobTitle] = useState(JOB_ROLES_PRESETS[0].title);
  const [jobDescription, setJobDescription] = useState(JOB_ROLES_PRESETS[0].description);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(DEMO_JOB_MATCH_RESULT);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = JOB_ROLES_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setJobTitle(preset.title);
      setJobDescription(preset.description);
    }
  };

  const handleRunMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchResult(DEMO_JOB_MATCH_RESULT);
    }, 700);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Role Benchmark
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Job Description Alignment & Gap Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Evaluate your resume against specific job requirements. Identify missing keywords and compute skill alignment.
          </p>
        </div>

        {onStartInterview && (
          <button
            onClick={onStartInterview}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition cursor-pointer self-start md:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interview Prep Cockpit</span>
          </button>
        )}
      </div>

      {/* Preset Role Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
          Preset Roles:
        </span>
        {JOB_ROLES_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer shrink-0 ${
              selectedPreset === preset.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-sm"
                : "bg-white dark:bg-[#111318] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-[#20242e] hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Grid: Job Inputs (5 cols) vs. Gap Analysis (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Description Input */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
              Target Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#202533] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
              Requirements & Description
            </label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0a0c10] border border-slate-200 dark:border-[#202533] text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600 leading-relaxed"
            />
          </div>

          <button
            onClick={handleRunMatch}
            disabled={isMatching}
            className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Computing Semantic Similarity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Run Gap Analysis & Match</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Match Analysis & Missing Keywords */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Score Matrix */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Match Diagnostics
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                High Alignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Overall</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.overall_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Skills</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.skill_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Experience</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.experience_match_score}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e13] border border-slate-100 dark:border-[#1a1e29]">
                <p className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">Education</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.education_match_score}%</p>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Matched Skills */}
            <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Matched ATS Keywords ({matchResult.matched_skills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matched_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Missing ATS Keywords ({matchResult.missing_skills.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-mono flex items-center gap-1"
                  >
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Gap Mitigation Plan */}
          <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Strategic Resume Adjustments For This Role
            </h3>
            <ul className="space-y-2 text-xs">
              {matchResult.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1.5 shrink-0"></span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
