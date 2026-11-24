"use client";

import React, { memo } from "react";
import { Download, RotateCcw, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";

interface TurnRecord {
  round: number;
  question: string;
  answer?: string;
  feedback?: string;
}

interface InterviewScorecardModalProps {
  scorecard: any;
  candidateName: string;
  role: string;
  turns: TurnRecord[];
  onExport: () => void;
  onReset: () => void;
}

export const InterviewScorecardModal = memo(function InterviewScorecardModal({
  scorecard,
  candidateName,
  role,
  turns,
  onExport,
  onReset,
}: InterviewScorecardModalProps) {
  if (!scorecard) return null;

  return (
    <div className="relative max-w-3xl mx-auto rounded-3xl border border-slate-200 dark:border-[#202533] bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#111318] dark:via-[#0c0e13] dark:to-[#08090d] p-6 sm:p-10 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1e2330]">
        <div>
          <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider">
            Executive Evaluation Completed
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Marcus Vance's Candidate Scorecard
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {candidateName.trim() || "Candidate"} • {role.trim() || "Software Engineer"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#252b3a] bg-slate-100 dark:bg-[#161922] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#1f2430] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Executive Verdict Badge */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Bar Raiser Verdict
          </span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {scorecard.verdict || "Hire Qualified"}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Sprint Duration
          </span>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono">
            5:00 Completed
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
          Executive Summary
        </h3>
        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed bg-white dark:bg-[#141720] p-4 rounded-xl border border-slate-200 dark:border-[#1e2330]">
          {scorecard.summary || "Candidate demonstrated clear technical execution and solid alignment with role competencies."}
        </p>
      </div>

      {/* Strengths & Recommendations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] space-y-2">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Key Strengths</span>
          </span>
          <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
            {(scorecard.top_strengths || []).map((s: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] space-y-2">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-500" />
            <span>Recommendations</span>
          </span>
          <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
            {(scorecard.preparation_recommendations || []).map((r: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 7-Day CareerPilot Practice Plan */}
      {scorecard.practice_plan_7_days?.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>CareerPilot 7-Day Practice Plan</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              Targeted Remediation Drills
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {scorecard.practice_plan_7_days.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-[#1e2330] bg-white dark:bg-[#141720] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                    Day {item.day}: {item.focus}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-zinc-300 text-[11px] leading-relaxed">
                  {item.exercise}
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <span>🎯 Target: {item.target_metric}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Practiced */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
          Questions & Answers Practiced ({turns.length})
        </h3>
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {turns.map((t, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-[#13161f] border border-slate-200 dark:border-[#1e2330] text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span>Question {idx + 1}</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white">{t.question}</p>
              {t.answer && (
                <p className="text-slate-600 dark:text-zinc-400 text-[11px] italic">
                  Your Answer: "{t.answer}"
                </p>
              )}
              {t.feedback && (
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px] bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  💡 Tip: {t.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
