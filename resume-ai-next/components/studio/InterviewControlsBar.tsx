"use client";

import React, { memo } from "react";
import { Mic, MicOff, RefreshCw, ArrowRight } from "lucide-react";

interface InterviewControlsBarProps {
  currentAnswer: string;
  onAnswerChange: (text: string) => void;
  onSubmitAnswer: () => void;
  isSubmitting: boolean;
  isRecordingVoice: boolean;
  recordingFormatted: string;
  audioLevel: number;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
  onStartRecording: () => void;
  onStopRecordingAndSubmit: () => void;
}

export const InterviewControlsBar = memo(function InterviewControlsBar({
  currentAnswer,
  onAnswerChange,
  onSubmitAnswer,
  isSubmitting,
  isRecordingVoice,
  recordingFormatted,
  audioLevel,
  isHandsFree,
  onToggleHandsFree,
  onStartRecording,
  onStopRecordingAndSubmit,
}: InterviewControlsBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#202533] bg-white dark:bg-[#111318] p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your Response</span>
          </span>
          {isRecordingVoice && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Live Audio {recordingFormatted}</span>
            </span>
          )}
          {isSubmitting && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Evaluating Response...</span>
            </span>
          )}
        </div>

        {/* Voice Mode Controls */}
        <div className="flex items-center gap-2">
          {/* Hands-Free JARVIS VAD Toggle */}
          <button
            type="button"
            onClick={onToggleHandsFree}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
              isHandsFree
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-slate-100 dark:bg-[#191d28] text-slate-500 border-slate-200 dark:border-[#282d3c]"
            }`}
            title="Toggle Hands-Free Auto-Turn (Auto-submits when you stop speaking)"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isHandsFree ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span>JARVIS Auto-Turn: {isHandsFree ? "ON" : "OFF"}</span>
          </button>

          {/* Voice Record Toggle Button */}
          {!isRecordingVoice ? (
            <button
              type="button"
              onClick={onStartRecording}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Start Speaking</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopRecordingAndSubmit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer shadow-xs animate-pulse"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>Finish & Submit</span>
            </button>
          )}
        </div>
      </div>

      {/* Real Live Audio Waveform Equalizer driven by Web Audio API */}
      {isRecordingVoice && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#151821] rounded-xl border border-slate-200 dark:border-[#262b3a]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Speaking to Marcus
            </span>
            {isHandsFree && (
              <span className="text-[10px] text-slate-400 font-mono">
                (Auto-submits after 1.8s pause)
              </span>
            )}
          </div>
          {/* Live Frequency Bars */}
          <div className="flex items-center gap-1">
            {[0.4, 0.8, 1.2, 0.6, 1.5, 0.9, 1.1, 0.5, 1.4, 0.7, 1.0, 0.3].map((factor, i) => {
              const height = Math.max(6, Math.min(32, audioLevel * factor * 140));
              return (
                <span
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Answer Text Area */}
      <textarea
        rows={3}
        value={currentAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Speak naturally into your mic (JARVIS hands-free mode active), or type your answer here..."
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#262b3a] bg-slate-50 dark:bg-[#151821] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs focus:outline-hidden focus:border-emerald-500 transition leading-relaxed resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onSubmitAnswer();
          }
        }}
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
          {isRecordingVoice ? (isHandsFree ? "Speak freely — pauses auto-submit" : "Click 'Finish & Submit' when done") : "Press Ctrl+Enter or Submit"}
        </span>

        <button
          onClick={onSubmitAnswer}
          disabled={!currentAnswer.trim() || isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition cursor-pointer shadow-md disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
});
