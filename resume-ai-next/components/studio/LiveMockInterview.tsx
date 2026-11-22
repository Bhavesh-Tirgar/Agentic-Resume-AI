"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, 
  Sparkles, CheckCircle2, UserCheck, MessageSquare, 
  Download, ArrowRight, ArrowLeft
} from "lucide-react";
import { 
  startVirtualHRInterviewApi, 
  sendVirtualHRAnswerApi, 
  finishVirtualHRInterviewApi, 
  getActiveResumeId 
} from "@/lib/api";
import { CameraFeedHUD, CameraFeedHUDRef } from "./CameraFeedHUD";

interface LiveMockInterviewProps {
  activeResumeId?: number;
  initialRole?: string;
  onFinish?: (scorecard: any) => void;
}

interface TurnRecord {
  round: number;
  question: string;
  answer?: string;
  feedback?: string;
}

export function LiveMockInterview({ activeResumeId, initialRole, onFinish }: LiveMockInterviewProps) {
  const [roleInput, setRoleInput] = useState(initialRole || "");
  const [candidateNameInput, setCandidateNameInput] = useState("");
  const [maxRounds, setMaxRounds] = useState(3);
  
  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  // Turn history
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<string | null>(null);

  // Scorecard
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Camera HUD reference
  const cameraRef = useRef<CameraFeedHUDRef>(null);

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

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

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
      alert("Speech-to-text is not supported in this browser. You can type your answer in the box.");
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
      const nameToSend = candidateNameInput.trim() || "Candidate";
      const roleToSend = roleInput.trim() || "Software Engineer";
      const res = await startVirtualHRInterviewApi({
        candidate_name: nameToSend,
        target_role: roleToSend,
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
    const snapshot = cameraRef.current?.captureSnapshot();

    try {
      const res = await sendVirtualHRAnswerApi({
        session_id: sessionId,
        candidate_answer: submittedText,
        snapshot_base64: snapshot || undefined
      });

      // Update current turn with answer & feedback
      setTurns(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1].answer = submittedText;
          copy[copy.length - 1].feedback = res.evaluation.critique;
        }
        if (!res.is_final_round && res.next_question) {
          copy.push({
            round: res.next_round,
            question: res.next_question
          });
        }
        return copy;
      });

      setLatestFeedback(res.evaluation.critique);
      setCurrentAnswer("");

      if (res.is_final_round) {
        handleFinishInterview();
      } else if (res.next_question) {
        setCurrentRound(res.next_round);
        setCurrentQuestion(res.next_question);
        handleSpeakQuestion(res.next_question);
      }
    } catch (err: any) {
      alert("Error submitting answer: " + err.message);
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
      alert("Error completing interview: " + err.message);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExportScorecard = () => {
    if (!scorecard) return;
    const displayName = candidateNameInput.trim() || "Candidate";
    const displayRole = roleInput.trim() || "Professional";
    const report = `# Mock Interview Summary
**Candidate:** ${displayName}
**Target Role:** ${displayRole}
**Status:** Completed (${turns.length} Questions Practiced)

## Overall Feedback
${scorecard.summary}

## Key Strengths
${(scorecard.top_strengths || []).map((s: string) => `- ${s}`).join("\n")}

## Tips for Your Real Interview
${(scorecard.preparation_recommendations || []).map((r: string) => `- ${r}`).join("\n")}

## Questions & Answers Practiced
${turns.map((t, i) => `### Question ${i + 1}\n**${t.question}**\n\n**Your Answer:** ${t.answer || "N/A"}\n\n**Feedback:** ${t.feedback || "Good response."}\n`).join("\n---\n\n")}
`;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Interview_Notes_${displayName.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1. Setup / Pre-Interview Screen
  if (!sessionId) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#1e2330] pb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Mock Interview Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Practice answering real interview questions with instant, helpful coaching.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={candidateNameInput}
              onChange={(e) => setCandidateNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#161922] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 text-xs"
              placeholder="e.g. Your Name (Optional)"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Target Role
            </label>
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#161922] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 text-xs"
              placeholder="e.g. Software Engineer, Product Manager"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] space-y-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>How it works</span>
          </span>
          <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
            Sarah will ask you questions one by one. You can speak into your microphone or type your answer. After each question, you'll get immediate tips to help you shine in real interviews.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleStartInterview}
            disabled={isStarting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Preparing Questions...</span>
              </>
            ) : (
              <>
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. Final Summary Screen
  if (scorecard) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1e2330]">
          <div>
            <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
              Interview Complete
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Practice Summary & Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {candidateNameInput.trim() || "Candidate"} • {roleInput.trim() || "Target Role"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportScorecard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Notes</span>
            </button>
            <button
              onClick={() => {
                setSessionId(null);
                setScorecard(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-[#272d3b] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#1a1f2b] transition cursor-pointer"
            >
              Practice Again
            </button>
          </div>
        </div>

        {/* Recruiter Summary Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#141720] border border-slate-200 dark:border-[#1e2330] space-y-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white text-xs block">
            Overall Impression:
          </span>
          <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-xs">
            {scorecard.summary}
          </p>
        </div>

        {/* Strengths & Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>What You Did Well</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
              {(scorecard.top_strengths || []).map((str: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Tips for the Real Interview</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
              {(scorecard.preparation_recommendations || []).map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Questions Practiced Review */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            Questions Reviewed ({turns.length})
          </h4>
          <div className="space-y-3">
            {turns.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1e2330] bg-slate-50/50 dark:bg-[#13161f] space-y-1.5 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Q{idx + 1}: {t.question}
                </p>
                {t.answer && (
                  <p className="text-slate-600 dark:text-zinc-400 italic">
                    "{t.answer}"
                  </p>
                )}
                {t.feedback && (
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px] pt-1 border-t border-slate-200/50 dark:border-[#1e2330]">
                    💡 <strong>Coaching:</strong> {t.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Turn-by-Turn Room
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#20242e] bg-white dark:bg-[#111318] p-5 sm:p-6 shadow-sm max-w-4xl mx-auto space-y-5">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2330]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mock Interview • {roleInput}
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#191d27] text-slate-600 dark:text-zinc-400">
            Question {currentRound} of {maxRounds}
          </span>
          <button
            onClick={handleFinishInterview}
            disabled={isFinishing}
            className="px-3 py-1 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            {isFinishing ? "Finishing..." : "End Practice"}
          </button>
        </div>
      </div>

      {/* Main Grid: Interviewer Question (Left) & Clean Video (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Sarah's Question Card (7 cols) */}
        <div className="sm:col-span-7 space-y-3">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interviewer</span>
              </span>

              <button
                onClick={() => handleSpeakQuestion(currentQuestion)}
                className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                title="Read question out loud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Stop Voice" : "Listen"}</span>
              </button>
            </div>

            <p className="text-sm text-slate-900 dark:text-white font-medium leading-relaxed">
              "{currentQuestion}"
            </p>
          </div>

          {/* Conversational Coaching Tip */}
          {latestFeedback && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#202533] bg-slate-50 dark:bg-[#0c0e14] text-xs space-y-1">
              <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                💡 Tip on your last answer:
              </span>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                {latestFeedback}
              </p>
            </div>
          )}
        </div>

        {/* Clean Candidate Video Tile (5 cols) */}
        <div className="sm:col-span-5">
          <CameraFeedHUD ref={cameraRef} />
        </div>
      </div>

      {/* Candidate Response Input Area */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1e2330]">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-700 dark:text-zinc-300">
            Your Answer
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
            <span>{isListening ? "Listening... (Click to Finish)" : "Speak Answer"}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Speak or type your answer here... (Tip: Mention the situation, what action you took, and what the outcome was)"
          className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-[#272d3b] bg-slate-50 dark:bg-[#141720] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Use the STAR format: Situation, Task, Action, and Result.
          </span>

          <button
            onClick={handleSubmitAnswer}
            disabled={!currentAnswer.trim() || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Answer...</span>
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
