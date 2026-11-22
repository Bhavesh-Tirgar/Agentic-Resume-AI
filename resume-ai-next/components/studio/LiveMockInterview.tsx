"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, 
  Sparkles, CheckCircle2, AlertCircle, Award, Target, 
  Download, ArrowRight, UserCheck, MessageSquare, ChevronRight
} from "lucide-react";
import { 
  startVirtualHRInterviewApi, 
  sendVirtualHRAnswerApi, 
  finishVirtualHRInterviewApi, 
  getActiveResumeId 
} from "@/lib/api";

interface LiveMockInterviewProps {
  activeResumeId?: number;
  initialRole?: string;
  onFinish?: (scorecard: any) => void;
}

interface TurnRecord {
  round: number;
  question: string;
  answer?: string;
  star_score?: number;
  clarity_score?: number;
  critique?: string;
}

export function LiveMockInterview({ activeResumeId, initialRole, onFinish }: LiveMockInterviewProps) {
  const [roleInput, setRoleInput] = useState(initialRole || "Senior Software Engineer");
  const [candidateNameInput, setCandidateNameInput] = useState("Alex Morgan");
  const [maxRounds, setMaxRounds] = useState(4);
  
  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  // Turn history
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<{
    star_score: number;
    clarity_score: number;
    critique: string;
  } | null>(null);

  // Scorecard
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Voice Speech Synthesis & Recognition
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + " ";
          }
          setCurrentAnswer((prev) => (transcript.trim().length > prev.length ? transcript.trim() : prev));
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to speech for Sarah
  const handleSpeakQuestion = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. You can type your answer in the box.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Microphone start failed:", err);
      }
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const resumeId = activeResumeId || getActiveResumeId();
      const res = await startVirtualHRInterviewApi({
        candidate_name: candidateNameInput,
        target_role: roleInput,
        resume_id: resumeId,
        max_rounds: maxRounds
      });

      setSessionId(res.session_id);
      setCurrentRound(res.current_round);
      setCurrentQuestion(res.question);
      setTurns([
        {
          round: 1,
          question: res.question
        }
      ]);
      setLatestFeedback(null);
      setScorecard(null);
      
      // Auto-speak greeting and first question
      handleSpeakQuestion(res.question);
    } catch (err: any) {
      alert("Failed to start interview: " + (err.message || "Unknown error"));
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentAnswer.trim() || isSubmitting) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSubmitting(true);
    const submittedText = currentAnswer.trim();

    try {
      const res = await sendVirtualHRAnswerApi({
        session_id: sessionId,
        candidate_answer: submittedText
      });

      // Update current turn with answer & evaluation
      setTurns(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1].answer = submittedText;
          copy[copy.length - 1].star_score = res.evaluation.star_score;
          copy[copy.length - 1].clarity_score = res.evaluation.clarity_score;
          copy[copy.length - 1].critique = res.evaluation.critique;
        }
        if (!res.is_final_round && res.next_question) {
          copy.push({
            round: res.next_round,
            question: res.next_question
          });
        }
        return copy;
      });

      setLatestFeedback({
        star_score: res.evaluation.star_score,
        clarity_score: res.evaluation.clarity_score,
        critique: res.evaluation.critique
      });

      setCurrentAnswer("");

      if (res.is_final_round) {
        // Complete interview
        handleFinishInterview();
      } else if (res.next_question) {
        setCurrentRound(res.next_round);
        setCurrentQuestion(res.next_question);
        handleSpeakQuestion(res.next_question);
      }
    } catch (err: any) {
      alert("Error evaluating response: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!sessionId) return;
    setIsFinishing(true);
    try {
      const res = await finishVirtualHRInterviewApi(sessionId);
      setScorecard(res.scorecard);
      onFinish?.(res.scorecard);
    } catch (err: any) {
      alert("Error finalizing scorecard: " + err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExportScorecard = () => {
    if (!scorecard) return;
    const report = `# Virtual HR Candidate Evaluation Report
**Candidate:** ${candidateNameInput}
**Target Role:** ${roleInput}
**Overall Score:** ${scorecard.overall_score} / 100
**Verdict:** ${scorecard.verdict}

## Executive Summary
${scorecard.summary}

## Competency Breakdown
- Communication: ${scorecard.communication_score}%
- Technical & Domain Depth: ${scorecard.technical_depth_score}%
- Problem Solving: ${scorecard.problem_solving_score}%
- Leadership & Ownership: ${scorecard.leadership_score}%

## Key Strengths
${scorecard.top_strengths.map((s: string) => `- ${s}`).join("\n")}

## Critical Gaps & Areas to Improve
${scorecard.critical_gaps.map((g: string) => `- ${g}`).join("\n")}

## Recommended Preparation Drills
${scorecard.preparation_recommendations.map((r: string) => `- ${r}`).join("\n")}

---
*Generated by Virtual HR Mock Interviewer*
`;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Interview_Scorecard_${candidateNameInput.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // State 1: Configuration / Pre-Interview Screen
  if (!sessionId) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-6 shadow-sm max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1e2330] pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Virtual HR Mock Interview
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Practice a live interactive interview with Sarah (Principal Recruiter). Receive immediate coaching after every answer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateNameInput}
              onChange={(e) => setCandidateNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#161922] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              placeholder="e.g. Alex Morgan"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
              Target Position
            </label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#161922] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] space-y-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>How This Interactive Mock Works</span>
          </span>
          <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400 list-disc list-inside">
            <li><strong>Voice or Text:</strong> You can speak using your microphone or type your responses.</li>
            <li><strong>Turn-by-Turn Feedback:</strong> Sarah evaluates your answer for Situation, Task, Action, and Result (STAR).</li>
            <li><strong>Adaptive Questions:</strong> The interviewer asks contextual follow-ups based on what you share.</li>
            <li><strong>Executive Scorecard:</strong> Receive a comprehensive hireability rating and breakdown at the end.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleStartInterview}
            disabled={isStarting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing Interview Room...</span>
              </>
            ) : (
              <>
                <span>Start Mock Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // State 2: Final Scorecard View
  if (scorecard) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-6 shadow-sm max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1e2330]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Executive Assessment Report
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Candidate Hiring Scorecard
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {candidateNameInput} • {roleInput}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportScorecard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
            <button
              onClick={() => {
                setSessionId(null);
                setScorecard(null);
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-[#272d3b] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1a1f2b] transition cursor-pointer"
            >
              Start New Session
            </button>
          </div>
        </div>

        {/* Scorecard Hero Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-[#1f2533]">
          <div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block mb-1">
              Overall Hireability Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {scorecard.overall_score}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">/ 100</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block mb-1">
              Hiring Bar Verdict
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              {scorecard.verdict}
            </span>
          </div>

          <div className="sm:col-span-1">
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block mb-1">
              Interview Rounds
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              {turns.length} Completed Rounds Evaluated
            </span>
          </div>

          <div className="sm:col-span-3 pt-3 border-t border-slate-200/80 dark:border-[#1c212d] text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-white">Recruiter Summary: </span>
            {scorecard.summary}
          </div>
        </div>

        {/* 4 Competency Bars */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Core Competency Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 dark:border-[#1a1f2b] bg-slate-50/50 dark:bg-[#13161f]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">Communication & Brevity</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{scorecard.communication_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#202636] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorecard.communication_score}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 dark:border-[#1a1f2b] bg-slate-50/50 dark:bg-[#13161f]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">Technical & Domain Depth</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{scorecard.technical_depth_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#202636] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorecard.technical_depth_score}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 dark:border-[#1a1f2b] bg-slate-50/50 dark:bg-[#13161f]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">Problem Solving & Rigor</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{scorecard.problem_solving_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#202636] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorecard.problem_solving_score}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-lg border border-slate-100 dark:border-[#1a1f2b] bg-slate-50/50 dark:bg-[#13161f]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">Leadership & Collaboration</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{scorecard.leadership_score}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#202636] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scorecard.leadership_score}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-slate-50 dark:bg-[#111318] space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Key Strengths</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
              {scorecard.top_strengths.map((str: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-slate-50 dark:bg-[#111318] space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Recommended Drills</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
              {scorecard.preparation_recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Active Live Turn-by-Turn Room
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 shadow-sm max-w-4xl mx-auto space-y-5">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2330]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mock Interview • {roleInput}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Interviewer: Sarah (Talent Partner)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-[#191d27] border border-slate-200 dark:border-[#272d3b] text-slate-700 dark:text-zinc-300">
            Round {currentRound} of {maxRounds}
          </span>
          <button
            onClick={handleFinishInterview}
            disabled={isFinishing}
            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            {isFinishing ? "Finalizing..." : "Finish Early"}
          </button>
        </div>
      </div>

      {/* Virtual HR Question Box */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sarah (Virtual HR)</span>
          </span>

          <button
            onClick={() => handleSpeakQuestion(currentQuestion)}
            className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            title="Listen to Sarah speak this question"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? "Stop Voice" : "Hear Question"}</span>
          </button>
        </div>

        <p className="text-sm text-slate-900 dark:text-white font-medium leading-relaxed">
          "{currentQuestion}"
        </p>
      </div>

      {/* Real-Time Turn Coaching Banner (if available) */}
      {latestFeedback && (
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#202533] bg-slate-50 dark:bg-[#0c0e14] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Last Response Coaching:</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">STAR Score: {latestFeedback.star_score}/100</span>
              <span className="text-slate-400 dark:text-zinc-500">|</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Clarity: {latestFeedback.clarity_score}/100</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-zinc-400 italic">
            💡 {latestFeedback.critique}
          </p>
        </div>
      )}

      {/* Candidate Response Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-slate-700 dark:text-zinc-300">
            Your Response (Use the STAR Method: Situation, Task, Action, Result)
          </label>
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              isListening 
                ? "bg-rose-500 text-white animate-pulse" 
                : "bg-slate-100 dark:bg-[#1a1f2b] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#252c3d]"
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isListening ? "Listening... (Click to Stop)" : "Speak Response"}</span>
          </button>
        </div>

        <textarea
          rows={4}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Describe the context, your specific responsibilities, the concrete action you executed, and the measurable business or technical results..."
          className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#141720] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Tip: Mention verifiable metrics and personal ownership for top scores.
          </span>

          <button
            onClick={handleSubmitAnswer}
            disabled={!currentAnswer.trim() || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
