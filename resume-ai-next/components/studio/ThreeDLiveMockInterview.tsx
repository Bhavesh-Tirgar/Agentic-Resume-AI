"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, 
  Sparkles, CheckCircle2, UserCheck, MessageSquare, 
  Download, ArrowRight, Clock, AlertTriangle, ShieldCheck,
  ChevronRight, Play, RotateCcw, Radio
} from "lucide-react";
import { 
  startVirtualHRInterviewApi, 
  sendVirtualHRAnswerApi, 
  finishVirtualHRInterviewApi, 
  transcribeWhisperAudioApi,
  getActiveResumeId 
} from "@/lib/api";
import { InterviewerAvatar3D, AvatarState } from "./InterviewerAvatar3D";
import { CameraFeedHUD, CameraFeedHUDRef } from "./CameraFeedHUD";

interface ThreeDLiveMockInterviewProps {
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

const TOTAL_INTERVIEW_SECONDS = 300; // 5 Minutes exactly

const POPULAR_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Architect",
  "Product Manager",
  "Data Scientist",
  "DevOps & Cloud Lead"
];

export function ThreeDLiveMockInterview({ activeResumeId, initialRole, onFinish }: ThreeDLiveMockInterviewProps) {
  // Candidate & Role state
  const [roleInput, setRoleInput] = useState(initialRole || "");
  const [candidateNameInput, setCandidateNameInput] = useState("");
  const [maxRounds, setMaxRounds] = useState(4);
  
  // Session states
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  // 3D Avatar state
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [textToSpeak, setTextToSpeak] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // 5-Minute Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_INTERVIEW_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // Turn history & feedback
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<string | null>(null);

  // Scorecard
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Camera HUD reference
  const cameraRef = useRef<CameraFeedHUDRef>(null);

  // Neural Human Voice Audio Player (Marcus Vance)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioBase64Ref = useRef<string | null>(null);

  const playNeuralAudio = useCallback((audioBase64?: string | null) => {
    if (!audioBase64) return;
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      currentAudioBase64Ref.current = audioBase64;
      const audio = new Audio(audioBase64);
      audioPlayerRef.current = audio;
      setAvatarState("speaking");

      audio.onended = () => {
        setAvatarState("idle");
      };
      audio.onerror = () => {
        setAvatarState("idle");
      };

      audio.play().catch((err) => {
        console.warn("Audio autoplay notice:", err);
        setAvatarState("idle");
      });
    } catch (err) {
      console.warn("Audio player error:", err);
      setAvatarState("idle");
    }
  }, []);

  const handleStopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTextToSpeak(null);
    setAvatarState("idle");
  };

  const handleReplayAudio = () => {
    if (currentAudioBase64Ref.current) {
      playNeuralAudio(currentAudioBase64Ref.current);
    } else if (currentQuestion) {
      setTextToSpeak(currentQuestion);
    }
  };

  // Native Audio Recording via MediaRecorder + Whisper
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 5-Minute Timer Countdown Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && secondsRemaining > 0 && !scorecard) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, secondsRemaining, scorecard]);

  // Handle 5-Minute Time Expiration
  const handleTimeExpired = useCallback(async () => {
    setIsTimerActive(false);
    if (sessionId && !scorecard && !isFinishing) {
      setIsFinishing(true);
      try {
        const res = await finishVirtualHRInterviewApi(sessionId);
        setScorecard(res.scorecard);
        onFinish?.(res.scorecard);
      } catch (err) {
        console.warn("Time expired finish error:", err);
      } finally {
        setIsFinishing(false);
      }
    }
  }, [sessionId, scorecard, isFinishing, onFinish]);

  // Cleanup media recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Start microphone recording using native HTML5 MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = ""; // use browser default
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // collect 250ms chunks
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      setAvatarState("listening");

      // Start recording seconds counter
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      alert("Microphone access denied or not available. Please allow mic permissions in your browser or type your answer below.");
    }
  };

  // Stop recording and send audio to local Whisper engine
  const stopRecordingAndTranscribe = async () => {
    if (!mediaRecorderRef.current || !isRecordingVoice) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      // Release mic stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      setIsRecordingVoice(false);
      const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });

      if (audioBlob.size < 500) {
        setAvatarState("idle");
        return;
      }

      // Convert Blob to base64
      setIsTranscribing(true);
      setAvatarState("thinking");

      try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await transcribeWhisperAudioApi(base64Audio);
            const transcribed = res.transcribed_text?.trim() || "";
            if (transcribed) {
              setCurrentAnswer((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
            }
          } catch (err: any) {
            console.error("Whisper transcription failed:", err);
            alert("Whisper speech-to-text error: " + (err.message || "Failed to transcribe audio"));
          } finally {
            setIsTranscribing(false);
            setAvatarState("idle");
          }
        };
      } catch (err: any) {
        console.error("FileReader failed:", err);
        setIsTranscribing(false);
        setAvatarState("idle");
      }
    };

    recorder.stop();
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const resumeId = activeResumeId || getActiveResumeId();
      const resolvedName = candidateNameInput.trim() || "Candidate";
      const resolvedRole = roleInput.trim() || "Software Engineer";

      const res = await startVirtualHRInterviewApi({
        candidate_name: resolvedName,
        target_role: resolvedRole,
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
      setSecondsRemaining(TOTAL_INTERVIEW_SECONDS);
      setIsTimerActive(true);
      setTextToSpeak(null);

      // Play Marcus Vance's natural human neural voice
      if (res.audio_base64) {
        currentAudioBase64Ref.current = res.audio_base64;
        playNeuralAudio(res.audio_base64);
      }
    } catch (err: any) {
      alert("Failed to start mock interview: " + (err.message || "Unknown error"));
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentAnswer.trim() || isSubmitting) return;

    if (isRecordingVoice) {
      await stopRecordingAndTranscribe();
    }

    setIsSubmitting(true);
    setAvatarState("thinking");
    const submittedText = currentAnswer.trim();
    const snapshot = cameraRef.current?.captureSnapshot();

    try {
      const res = await sendVirtualHRAnswerApi({
        session_id: sessionId,
        candidate_answer: submittedText,
        snapshot_base64: snapshot || undefined
      });

      // Update turn record
      setTurns((prev) => {
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

      setAvatarState("idle");
      setLatestFeedback(res.evaluation.critique);
      setCurrentAnswer("");

      if (res.is_final_round) {
        handleFinishInterview();
      } else if (res.next_question) {
        setCurrentRound(res.next_round);
        setCurrentQuestion(res.next_question);
        setTextToSpeak(null);

        // Play Marcus Vance's follow-up question with real neural voice
        if (res.audio_base64) {
          currentAudioBase64Ref.current = res.audio_base64;
          playNeuralAudio(res.audio_base64);
        }
      }
    } catch (err: any) {
      setAvatarState("idle");
      alert("Error submitting answer: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!sessionId || isFinishing) return;
    setIsFinishing(true);
    setIsTimerActive(false);

    try {
      const res = await finishVirtualHRInterviewApi(sessionId);
      setScorecard(res.scorecard);
      onFinish?.(res.scorecard);
      setTextToSpeak(null);
    } catch (err: any) {
      alert("Error generating scorecard: " + (err.message || "Unknown error"));
    } finally {
      setIsFinishing(false);
    }
  };

  const handleExportScorecard = () => {
    if (!scorecard) return;
    const displayName = candidateNameInput.trim() || "Candidate";
    const displayRole = roleInput.trim() || "Professional";

    const report = `# 5-Minute Executive Mock Interview Summary
**Interviewer:** Marcus Vance (VP of Talent & Technical Bar Raiser)
**Candidate:** ${displayName}
**Target Role:** ${displayRole}
**Duration:** 5 Minutes Sprint (${turns.length} Questions Completed)
**Verdict:** ${scorecard.verdict || "Hire Qualified"}

## Executive Summary
${scorecard.summary}

## Key Strengths
${(scorecard.top_strengths || []).map((s: string) => `- ${s}`).join("\n")}

## Tips for Your Real Technical Interviews
${(scorecard.preparation_recommendations || []).map((r: string) => `- ${r}`).join("\n")}

## Questions & Answers Practiced
${turns.map((t, i) => `### Question ${i + 1}\n**${t.question}**\n\n**Your Answer:** ${t.answer || "N/A"}\n\n**Marcus Vance's Feedback:** ${t.feedback || "Good response."}\n`).join("\n---\n\n")}
`;
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Executive_Interview_${displayName.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format MM:SS for countdown timer
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const timerPct = (secondsRemaining / TOTAL_INTERVIEW_SECONDS) * 100;

  // Format recording seconds MM:SS
  const recMin = Math.floor(recordingSeconds / 60);
  const recSec = recordingSeconds % 60;
  const recFormatted = `${String(recMin).padStart(2, "0")}:${String(recSec).padStart(2, "0")}`;

  // 1. Setup Screen (Before Starting)
  if (!sessionId) {
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

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={candidateNameInput}
              onChange={(e) => setCandidateNameInput(e.target.value)}
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
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
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
            {POPULAR_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleInput(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  roleInput === r
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
            onClick={handleStartInterview}
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
  }

  // 2. Completed Scorecard Screen
  if (scorecard) {
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
              {candidateNameInput.trim() || "Candidate"} • {roleInput.trim() || "Software Engineer"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportScorecard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => {
                setSessionId(null);
                setScorecard(null);
                setTurns([]);
              }}
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
  }

  // 3. Active 3D Interview Stage
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Top Control Bar with 5-Minute Timer */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#202533] bg-white/80 dark:bg-[#111318]/90 backdrop-blur-md p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xs">
            R{currentRound}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Round {currentRound} of {maxRounds}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                • {roleInput.trim() || "Technical Interview"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Interviewer: <strong>Marcus Vance</strong> (VP of Talent)
            </p>
          </div>
        </div>

        {/* 5-Minute Live Circular Clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-[#252b3a]">
            <svg className="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-zinc-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  secondsRemaining > 120
                    ? "text-emerald-500 transition-all duration-1000"
                    : secondsRemaining > 60
                    ? "text-amber-500 transition-all duration-1000"
                    : "text-rose-500 animate-pulse transition-all duration-1000"
                }
                strokeDasharray={`${timerPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="flex flex-col">
              <span className={`font-mono text-xs font-bold leading-tight ${
                secondsRemaining <= 60 ? "text-rose-500 animate-pulse" : "text-slate-900 dark:text-white"
              }`}>
                {timeFormatted}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 leading-tight">
                {secondsRemaining <= 60 ? "Final Minute" : "Session Time"}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishInterview}
            disabled={isFinishing}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition cursor-pointer"
          >
            {isFinishing ? "Concluding..." : "End Early"}
          </button>
        </div>
      </div>

      {/* 3D Dual-Portal Stage */}
      <div 
        style={{ perspective: 1200 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Left Portal: Marcus Vance Avatar */}
        <div className="transform transition-transform duration-300 hover:rotate-y-1">
          <InterviewerAvatar3D
            state={avatarState}
            textToSpeak={textToSpeak}
            onSpeechEnd={() => setAvatarState("idle")}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onStopSpeaking={handleStopSpeaking}
            className="h-[340px]"
          />
        </div>

        {/* Right Portal: Candidate Video Feed */}
        <div className="transform transition-transform duration-300 hover:-rotate-y-1">
          <CameraFeedHUD ref={cameraRef} className="h-[340px]" />
        </div>
      </div>

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
                onClick={handleStopSpeaking}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition cursor-pointer border border-rose-500/20 font-sans"
                title="Stop audio voice"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReplayAudio}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#191d28] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer border border-slate-200 dark:border-[#272d3b] font-sans"
                title="Replay Marcus's voice question"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Voice</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
          {currentQuestion || "Preparing question..."}
        </p>
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

      {/* Candidate Response Console (Whisper Voice + Text) */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#202533] bg-white dark:bg-[#111318] p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your Response</span>
            </span>
            {isRecordingVoice && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Recording {recFormatted}</span>
              </span>
            )}
            {isTranscribing && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Whisper Transcribing...</span>
              </span>
            )}
          </div>

          {/* Voice Record Toggle Button */}
          <div className="flex items-center gap-2">
            {!isRecordingVoice ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Voice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecordingAndTranscribe}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer shadow-xs animate-pulse"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Done Speaking</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Waveform Animation while recording */}
        {isRecordingVoice && (
          <div className="flex items-center justify-center gap-1 py-2 bg-slate-50 dark:bg-[#151821] rounded-xl border border-slate-200 dark:border-[#262b3a]">
            <span className="text-[11px] font-mono text-slate-500 mr-2">Speaking...</span>
            {[40, 70, 90, 50, 100, 65, 80, 45, 95, 60, 85, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-emerald-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(8, (h * (recordingSeconds % 3 + 1)) % 28)}px`,
                  animationDelay: `${i * 80}ms`
                }}
              />
            ))}
          </div>
        )}

        {/* Answer Text Area */}
        <textarea
          rows={3}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Speak with the mic button above, or type your response here..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#262b3a] bg-slate-50 dark:bg-[#151821] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs focus:outline-hidden focus:border-emerald-500 transition leading-relaxed resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmitAnswer();
            }
          }}
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            {isRecordingVoice ? "Click 'Done Speaking' to transcribe" : "Press Ctrl+Enter or Submit"}
          </span>

          <button
            onClick={handleSubmitAnswer}
            disabled={!currentAnswer.trim() || isSubmitting || isTranscribing}
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
    </div>
  );
}
