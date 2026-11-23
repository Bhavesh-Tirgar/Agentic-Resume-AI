"use client";

import React, { memo } from "react";
import { Sparkles, Play, RefreshCw, Clock, AlertTriangle } from "lucide-react";

interface InterviewSetupCardProps {
  candidateName: string;
  onCandidateNameChange: (name: string) => void;
  role: string;
  onRoleChange: (role: string) => void;
  popularRoles: string[];
  isStarting: boolean;
  errorMessage: string | null;
  onDismissError: () => void;
  onStartInterview: () => void;
}

export const InterviewSetupCard = memo(function InterviewSetupCard({
  candidateName,
  onCandidateNameChange,
  role,
  onRoleChange,
  popularRoles,
  isStarting,
  errorMessage,
  onDismissError,
  onStartInterview,
}: InterviewSetupCardProps) {
  return (
    <div className="relative max-w-2xl mx-auto rounded-3xl border border-slate-200 dark:border-[#202533] bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#111318] dark:via-[#0c0e13] dark:to-[#08090d] p-6 sm:p-10 shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3.5 border-b border-slate-200 dark:border-[#1e2330] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Executive Mock Interview
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
              Live 5-Min Sprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Practice answering real technical and behavioral scenarios with <strong>Marcus Vance</strong> (VP of Talent).
          </p>
        </div>
      </div>

      {/* Dismissible Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onDismissError}
            className="text-red-500 hover:text-red-400 font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => onCandidateNameChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#272d3b] bg-white dark:bg-[#151821] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 text-xs shadow-xs"
            placeholder="e.g. Your Name (Optional)"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            Target Position
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#272d3b] bg-white dark:bg-[#151821] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 text-xs shadow-xs"
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
      </div>

      {/* Quick Role Selection Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
          Quick Select Role:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {popularRoles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRoleChange(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                role === r
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-xs"
                  : "bg-slate-100 dark:bg-[#161922] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-[#232836] hover:border-slate-300 dark:hover:border-zinc-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Minute Sprint Breakdown Info */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#13161f] border border-slate-200 dark:border-[#1e2330] space-y-2.5 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span>How the 5-Minute Sprint Works</span>
        </div>
        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
          Marcus will conduct a focused 4-round executive technical evaluation. You can speak into your microphone using OpenAI Whisper voice capture or type your answers. After each question, you'll receive immediate feedback to sharpen your STAR delivery.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
          <div className="p-2 rounded-lg bg-white dark:bg-[#1a1e29] border border-slate-200 dark:border-[#252b3a] text-center">
            <span className="text-emerald-500 font-bold block">Round 1</span>
            <span className="text-slate-500 dark:text-zinc-400">Background</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1a1e29] border border-slate-200 dark:border-[#252b3a] text-center">
            <span className="text-emerald-500 font-bold block">Round 2</span>
            <span className="text-slate-500 dark:text-zinc-400">STAR Challenge</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1a1e29] border border-slate-200 dark:border-[#252b3a] text-center">
            <span className="text-emerald-500 font-bold block">Round 3</span>
            <span className="text-slate-500 dark:text-zinc-400">Trade-offs</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-[#1a1e29] border border-slate-200 dark:border-[#252b3a] text-center">
            <span className="text-emerald-500 font-bold block">Round 4</span>
            <span className="text-slate-500 dark:text-zinc-400">Leadership</span>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onStartInterview}
          disabled={isStarting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isStarting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Launching Interview Stage...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Launch 5-Minute Mock Interview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});
