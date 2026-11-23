"use client";

import React, { memo } from "react";
import { MessageSquare, Sparkles, Radio, Volume2, VolumeX } from "lucide-react";

interface InterviewDialogueListProps {
  currentQuestion: string;
  isSubmitting: boolean;
  avatarState: string;
  latestFeedback: string | null;
  bargeInNotice: string | null;
  onStopSpeaking: () => void;
  onReplayAudio: () => void;
}

export const InterviewDialogueList = memo(function InterviewDialogueList({
  currentQuestion,
  isSubmitting,
  avatarState,
  latestFeedback,
  bargeInNotice,
  onStopSpeaking,
  onReplayAudio,
}: InterviewDialogueListProps) {
  return (
    <div className="space-y-3">
      {/* Marcus Vance Current Question Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#202533] bg-white dark:bg-[#111318] p-5 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
          <span className="flex items-center gap-1.5 font-semibold">
            <MessageSquare className="w-4 h-4" />
            <span>Marcus Vance:</span>
          </span>
          <div className="flex items-center gap-2">
            {avatarState === "speaking" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Speaking</span>
                <span className="flex items-center gap-0.5 ml-1">
                  {[10, 16, 7, 14, 9].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-emerald-500 rounded-full animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
            {avatarState === "speaking" ? (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer border border-rose-500/20 font-sans"
                title="Stop audio voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onReplayAudio}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#191d28] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-200 dark:border-[#272d3b] font-sans"
                title="Replay Marcus's voice question"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Voice</span>
              </button>
            )}
          </div>
        </div>
        {isSubmitting ? (
          <div className="flex items-center gap-3 py-1.5 text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            <span className="font-semibold">
              Marcus is analyzing your STAR delivery and calibrating follow-up question...
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion || "Preparing question..."}
          </p>
        )}
      </div>

      {/* Latest Constructive Coaching Tip */}
      {latestFeedback && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">💡 Marcus Vance's Coaching Tip:</span>
            <span className="leading-relaxed">{latestFeedback}</span>
          </div>
        </div>
      )}

      {/* Barge-In Interruption Notification */}
      {bargeInNotice && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2 animate-bounce">
          <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="font-semibold">{bargeInNotice}</span>
        </div>
      )}
    </div>
  );
});
