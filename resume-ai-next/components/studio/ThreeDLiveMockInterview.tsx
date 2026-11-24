"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, ChevronRight, MessageSquare, Mic, Play, Radio, RefreshCw, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { 
  startVirtualHRInterviewApi, 
  sendVirtualHRAnswerApi, 
  finishVirtualHRInterviewApi, 
  getActiveResumeId 
} from "@/lib/api";
import { InterviewerAvatar3D, AvatarState } from "./InterviewerAvatar3D";
import { CameraFeedHUD, CameraFeedHUDRef } from "./CameraFeedHUD";
import { InterviewSetupCard } from "./InterviewSetupCard";
import { InterviewScorecardModal } from "./InterviewScorecardModal";
import { InterviewDialogueList } from "./InterviewDialogueList";
import { InterviewControlsBar } from "./InterviewControlsBar";

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
  const [maxRounds] = useState(4);
  
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleStopSpeaking = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTextToSpeak(null);
    setAvatarState("idle");
  }, []);

  const handleReplayAudio = useCallback(() => {
    if (currentAudioBase64Ref.current) {
      playNeuralAudio(currentAudioBase64Ref.current);
    } else if (currentQuestion) {
      setTextToSpeak(currentQuestion);
    }
  }, [playNeuralAudio, currentQuestion]);

  // Native Audio Recording via MediaRecorder + Whisper & Real-Time VAD
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [bargeInNotice, setBargeInNotice] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>("");

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
  }, [isTimerActive, secondsRemaining, scorecard, handleTimeExpired]);

  // Cleanup media recording and audio context on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Finishing Interview
  const handleFinishInterview = useCallback(async () => {
    if (!sessionId || isFinishing) return;
    setIsFinishing(true);
    setIsTimerActive(false);

    try {
      const res = await finishVirtualHRInterviewApi(sessionId);
      setScorecard(res.scorecard);
      onFinish?.(res.scorecard);
      setTextToSpeak(null);
    } catch (err: any) {
      setErrorMessage("Error generating scorecard: " + (err.message || "Unknown error"));
    } finally {
      setIsFinishing(false);
    }
  }, [sessionId, isFinishing, onFinish]);

  // Dispatch turn answer (supports binary audio blob streaming, direct text, or fallback audio base64)
  const dispatchTurnAnswer = useCallback(async ({ textAnswer, audioBlob, audioBase64 }: { textAnswer?: string; audioBlob?: Blob; audioBase64?: string }) => {
    if (!sessionId || isSubmitting) return;

    setIsSubmitting(true);
    setAvatarState("thinking");
    const isCamOn = cameraRef.current?.isCameraActive?.() ?? false;
    const snapshot = isCamOn ? cameraRef.current?.captureSnapshot() : null;
    const liveVision = isCamOn ? cameraRef.current?.getLiveTelemetry?.() : null;

    try {
      const res = await sendVirtualHRAnswerApi({
        session_id: sessionId,
        candidate_answer: textAnswer,
        audio_blob: audioBlob,
        audio_base64: audioBase64,
        snapshot_base64: snapshot || undefined,
        vision_telemetry: isCamOn && liveVision ? {
          eye_contact_percentage: liveVision.eye_contact_percentage,
          confidence_score: liveVision.confidence_score,
          nervousness_score: liveVision.nervousness_score,
          gaze_direction: liveVision.gaze_direction,
          facial_demeanor: liveVision.facial_demeanor
        } : {
          eye_contact_percentage: 0,
          confidence_score: 20,
          nervousness_score: 0,
          gaze_direction: "Camera Off / Disabled",
          facial_demeanor: "Camera Off"
        }
      });

      const resolvedAnswerText = res.transcribed_text || textAnswer || (audioBlob || audioBase64 ? "Spoken response submitted" : "");

      // Update turn record
      setTurns((prev) => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1].answer = resolvedAnswerText;
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

      // Play Marcus Vance's response with natural neural voice and lip-sync
      if (res.audio_base64) {
        currentAudioBase64Ref.current = res.audio_base64;
        playNeuralAudio(res.audio_base64);
      }

      if (res.is_final_round) {
        handleFinishInterview();
      } else if (res.next_question) {
        setCurrentRound(res.next_round);
        setCurrentQuestion(res.next_question);
        setTextToSpeak(null);

        // In hands-free JARVIS mode, re-arm microphone after Marcus finishes speaking
        if (isHandsFree) {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.onended = () => {
              setAvatarState("idle");
              setTimeout(() => {
                startRecording();
              }, 400);
            };
          } else {
            setTimeout(() => {
              startRecording();
            }, 600);
          }
        }
      }
    } catch (err: any) {
      setAvatarState("idle");
      const msg = err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")
        ? "Cannot reach backend server. Please ensure Django is running on port 8000."
        : (err?.message || "Error submitting answer. Please try again.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, isSubmitting, isHandsFree, handleFinishInterview, playNeuralAudio]);

  // Stop recording and single-hop submit audio to backend
  const stopRecordingAndSubmit = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecordingVoice) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      setAudioLevel(0);
      setIsRecordingVoice(false);

      const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (audioBlob.size < 500) {
        setAvatarState("idle");
        return;
      }

      // High-performance binary upload: dispatch native Blob via multipart FormData
      const capturedText = liveTranscriptRef.current.trim() || currentAnswer.trim();
      await dispatchTurnAnswer({ 
        textAnswer: capturedText || undefined, 
        audioBlob: audioBlob 
      });
    };

    recorder.stop();
  }, [isRecordingVoice, currentAnswer, dispatchTurnAnswer]);

  // Start microphone recording with Web Audio API VAD & Barge-in
  const startRecording = useCallback(async () => {
    if (avatarState === "speaking") {
      handleStopSpeaking();
      setBargeInNotice("Barge-In: Marcus yielded the floor to you.");
      setTimeout(() => setBargeInNotice(null), 3000);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "";
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const pcmData = new Uint8Array(analyser.frequencyBinCount);
      hasSpokenRef.current = false;

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(pcmData);
        let sum = 0;
        for (let i = 0; i < pcmData.length; i++) {
          sum += pcmData[i];
        }
        const avg = sum / pcmData.length / 255;
        setAudioLevel(avg);

        if (avatarState === "speaking" && avg > 0.05) {
          handleStopSpeaking();
          setBargeInNotice("Barge-In: Marcus yielded the floor to you.");
          setTimeout(() => setBargeInNotice(null), 3000);
        }

        if (avg > 0.04) {
          hasSpokenRef.current = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasSpokenRef.current && avg <= 0.02 && isHandsFree) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                stopRecordingAndSubmit();
              }
            }, 1800);
          }
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animFrameRef.current = requestAnimationFrame(checkVolume);

      recorder.start(250);
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      setAvatarState("listening");

      liveTranscriptRef.current = "";
      if (typeof window !== "undefined") {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            recognition.onresult = (event: any) => {
              let interim = "";
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  liveTranscriptRef.current += event.results[i][0].transcript + " ";
                } else {
                  interim += event.results[i][0].transcript;
                }
              }
              const fullText = (liveTranscriptRef.current + " " + interim).trim();
              if (fullText) {
                setCurrentAnswer(fullText);
              }
            };
            recognition.onerror = () => {};
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (e) {
            console.warn("SpeechRecognition init skipped:", e);
          }
        }
      }

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage("Microphone access denied or not available. Please allow mic permissions in your browser or type your answer below.");
    }
  }, [avatarState, isHandsFree, handleStopSpeaking, stopRecordingAndSubmit]);

  // Handle Starting Interview
  const handleStartInterview = useCallback(async () => {
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

      if (res.audio_base64) {
        currentAudioBase64Ref.current = res.audio_base64;
        playNeuralAudio(res.audio_base64);

        if (isHandsFree && audioPlayerRef.current) {
          audioPlayerRef.current.onended = () => {
            setAvatarState("idle");
            setTimeout(() => {
              startRecording();
            }, 500);
          };
        }
      }
    } catch (err: any) {
      const msg = err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")
        ? "Could not connect to AI Interviewer. Make sure the backend server is running on port 8000."
        : (err?.message || "Failed to start mock interview. Please try again.");
      setErrorMessage(msg);
    } finally {
      setIsStarting(false);
    }
  }, [activeResumeId, candidateNameInput, roleInput, maxRounds, playNeuralAudio, isHandsFree, startRecording]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!sessionId || !currentAnswer.trim() || isSubmitting) return;

    if (isRecordingVoice) {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
    }

    await dispatchTurnAnswer({ textAnswer: currentAnswer.trim() });
  }, [sessionId, currentAnswer, isSubmitting, isRecordingVoice, dispatchTurnAnswer]);

  const handleExportScorecard = useCallback(() => {
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
  }, [scorecard, candidateNameInput, roleInput, turns]);

  // Formatted timing values
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const timerPct = (secondsRemaining / TOTAL_INTERVIEW_SECONDS) * 100;

  const recMin = Math.floor(recordingSeconds / 60);
  const recSec = recordingSeconds % 60;
  const recFormatted = `${String(recMin).padStart(2, "0")}:${String(recSec).padStart(2, "0")}`;

  // 1. Setup Screen
  if (!sessionId) {
    return (
      <InterviewSetupCard
        candidateName={candidateNameInput}
        onCandidateNameChange={setCandidateNameInput}
        role={roleInput}
        onRoleChange={setRoleInput}
        popularRoles={POPULAR_ROLES}
        isStarting={isStarting}
        errorMessage={errorMessage}
        onDismissError={() => setErrorMessage(null)}
        onStartInterview={handleStartInterview}
      />
    );
  }

  // 2. Completed Scorecard Screen
  if (scorecard) {
    return (
      <InterviewScorecardModal
        scorecard={scorecard}
        candidateName={candidateNameInput}
        role={roleInput}
        turns={turns}
        onExport={handleExportScorecard}
        onReset={() => {
          setSessionId(null);
          setScorecard(null);
          setTurns([]);
        }}
      />
    );
  }

  // 3. Active 3D Interview Stage
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Dismissible Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-400 font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
                className="text-slate-200 dark:text-zinc-800"
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

      {/* Dialogue List */}
      <InterviewDialogueList
        currentQuestion={currentQuestion}
        isSubmitting={isSubmitting}
        avatarState={avatarState}
        latestFeedback={latestFeedback}
        bargeInNotice={bargeInNotice}
        onStopSpeaking={handleStopSpeaking}
        onReplayAudio={handleReplayAudio}
      />

      {/* Candidate Controls Bar */}
      <InterviewControlsBar
        currentAnswer={currentAnswer}
        onAnswerChange={setCurrentAnswer}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        isRecordingVoice={isRecordingVoice}
        recordingFormatted={recFormatted}
        audioLevel={audioLevel}
        isHandsFree={isHandsFree}
        onToggleHandsFree={() => setIsHandsFree(!isHandsFree)}
        onStartRecording={startRecording}
        onStopRecordingAndSubmit={stopRecordingAndSubmit}
      />
    </div>
  );
}
