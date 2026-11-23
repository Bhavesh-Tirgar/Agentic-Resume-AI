"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Volume2, VolumeX, Sparkles, Mic, User } from "lucide-react";

export type AvatarState = "idle" | "speaking" | "listening" | "thinking";

interface InterviewerAvatar3DProps {
  state?: AvatarState;
  textToSpeak?: string | null;
  onSpeechEnd?: () => void;
  className?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onStopSpeaking?: () => void;
}

export function InterviewerAvatar3D({
  state = "idle",
  textToSpeak,
  onSpeechEnd,
  className = "",
  isMuted = false,
  onToggleMute,
  onStopSpeaking,
}: InterviewerAvatar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameRef = useRef<number | null>(null);
  const [internalState, setInternalState] = useState<AvatarState>(state);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Update internal state if prop changes
  useEffect(() => {
    setInternalState(state);
  }, [state]);

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Male speech synthesis for Marcus Vance
  const speakText = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || isMuted) {
        onSpeechEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current = utterance;

      // Select top natural male voice
      const maleVoice =
        availableVoices.find((v) =>
          /Guy|David|George|James|Daniel|Oliver|Ryan|Alex|Male|Neural2-D/i.test(v.name)
        ) ||
        availableVoices.find((v) => v.lang.startsWith("en") && /male/i.test(v.name)) ||
        availableVoices.find((v) => v.lang === "en-US") ||
        availableVoices[0];

      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      // Executive Male Cadence
      utterance.pitch = 0.92;
      utterance.rate = 0.98;

      utterance.onstart = () => {
        setInternalState("speaking");
      };

      utterance.onend = () => {
        setInternalState("idle");
        onSpeechEnd?.();
      };

      utterance.onerror = () => {
        setInternalState("idle");
        onSpeechEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, isMuted, onSpeechEnd]
  );

  // Trigger speech when textToSpeak changes
  useEffect(() => {
    if (textToSpeak && textToSpeak.trim().length > 0) {
      speakText(textToSpeak);
    }
  }, [textToSpeak, speakText]);

  // Track mouse coordinates for interactive 3D head gaze
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      // Normalized between -1 and 1
      mousePos.current.targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      mousePos.current.targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 3D Canvas Procedural Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let blinkTimer = 0;
    let isBlinking = false;

    const render = () => {
      time += 0.035;

      // Smooth gaze interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08;

      const { x: gazeX, y: gazeY } = mousePos.current;

      // Periodic blink calculation
      blinkTimer += 0.016;
      if (blinkTimer > 3.5) {
        isBlinking = true;
        if (blinkTimer > 3.65) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      // Responsive canvas size
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;

      // 1. Subtle 3D Depth Backdrop Aura
      const auraGrad = ctx.createRadialGradient(cx, cy - 20, 20, cx, cy, width * 0.65);
      if (internalState === "speaking") {
        auraGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
        auraGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.12)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (internalState === "listening") {
        auraGrad.addColorStop(0, "rgba(59, 130, 246, 0.20)");
        auraGrad.addColorStop(0.5, "rgba(139, 92, 246, 0.10)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else if (internalState === "thinking") {
        auraGrad.addColorStop(0, "rgba(139, 92, 246, 0.28)");
        auraGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.16)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        auraGrad.addColorStop(0, "rgba(148, 163, 184, 0.08)");
        auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Audio-Reactive Holographic Pulse Rings when Speaking
      if (internalState === "speaking") {
        const pulse = (Math.sin(time * 6) + 1) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 85 + pulse * 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + pulse * 0.25})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy - 20, 105 + pulse * 28, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.10 + pulse * 0.18})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Natural Breathing & Head Kinematics
      const breathing = Math.sin(time * 1.5) * 2.5;
      const listeningNod = internalState === "listening" ? Math.sin(time * 2.2) * 3.5 : 0;
      const headTilt = internalState === "listening" ? 3.5 : 0;
      const eyeMicroSaccadeX = Math.sin(time * 3.1) * 0.8;
      const eyeMicroSaccadeY = Math.cos(time * 2.7) * 0.5;

      const headX = cx + gazeX * 14;
      const headY = cy - 30 + gazeY * 10 + breathing + headTilt + listeningNod;

      // 4. Executive Shoulders & Suit Torso
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 115 + breathing * 0.5, 95, 55, 0, 0, Math.PI * 2);
      const suitGrad = ctx.createLinearGradient(cx - 80, cy + 60, cx + 80, cy + 160);
      suitGrad.addColorStop(0, "#181d29");
      suitGrad.addColorStop(0.5, "#0f131c");
      suitGrad.addColorStop(1, "#0a0c12");
      ctx.fillStyle = suitGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Shirt Collar & Executive Tie
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy + 65);
      ctx.lineTo(cx, cy + 85);
      ctx.lineTo(cx + 26, cy + 65);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + 85);
      ctx.lineTo(cx - 8, cy + 130);
      ctx.lineTo(cx, cy + 140);
      ctx.lineTo(cx + 8, cy + 130);
      ctx.closePath();
      ctx.fillStyle = "#10b981";
      ctx.fill();
      ctx.restore();

      // 5. 3D Head Base Geometry
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(headX, headY, 52, 65, (gazeX * 0.08), 0, Math.PI * 2);
      const skinGrad = ctx.createRadialGradient(
        headX - 16 + gazeX * 5,
        headY - 18 + gazeY * 5,
        10,
        headX,
        headY,
        60
      );
      skinGrad.addColorStop(0, "#e2b696");
      skinGrad.addColorStop(0.6, "#c68d68");
      skinGrad.addColorStop(1, "#8e5a3c");
      ctx.fillStyle = skinGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 6. Styled Hair Geometry (Marcus Vance - Professional Cut)
      ctx.beginPath();
      ctx.ellipse(headX, headY - 42, 54, 28, gazeX * 0.06, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#1c1815";
      ctx.fill();

      // Left Hair Volume
      ctx.beginPath();
      ctx.ellipse(headX - 44, headY - 26, 12, 34, -0.2, Math.PI * 0.6, Math.PI * 1.5);
      ctx.fillStyle = "#1c1815";
      ctx.fill();

      // Right Hair Volume
      ctx.beginPath();
      ctx.ellipse(headX + 44, headY - 26, 12, 34, 0.2, Math.PI * 1.5, Math.PI * 2.4);
      ctx.fillStyle = "#1c1815";
      ctx.fill();

      // 7. Executive Eyebrows (Dynamic Elevation based on cognitive state)
      const leftBrowElevation = internalState === "thinking" ? 4.5 : 0;
      const rightBrowElevation = internalState === "listening" ? 1.5 : 0;

      ctx.beginPath();
      ctx.moveTo(headX - 32 + gazeX * 3, headY - 15 - leftBrowElevation + gazeY * 2);
      ctx.lineTo(headX - 10 + gazeX * 3, headY - 17 - leftBrowElevation + gazeY * 2);
      ctx.moveTo(headX + 10 + gazeX * 3, headY - 17 - rightBrowElevation + gazeY * 2);
      ctx.lineTo(headX + 32 + gazeX * 3, headY - 15 - rightBrowElevation + gazeY * 2);
      ctx.strokeStyle = "#1a1614";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // 8. Eyes & Interactive Gaze with Natural Micro-Saccades
      const eyeOffsetX = 19;
      const eyeOffsetY = -5;

      [-eyeOffsetX, eyeOffsetX].forEach((offsetX) => {
        const eyeCenterX = headX + offsetX + gazeX * 4 + eyeMicroSaccadeX;
        const eyeCenterY = headY + eyeOffsetY + gazeY * 3 + eyeMicroSaccadeY;

        if (isBlinking) {
          ctx.beginPath();
          ctx.moveTo(eyeCenterX - 9, eyeCenterY);
          ctx.lineTo(eyeCenterX + 9, eyeCenterY);
          ctx.strokeStyle = "#4a2d1d";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Eye Sclera (White)
          ctx.beginPath();
          ctx.ellipse(eyeCenterX, eyeCenterY, 9, 6, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#f8fafc";
          ctx.fill();

          // Iris (Deep Hazel-Brown)
          const irisX = eyeCenterX + gazeX * 3.5 + eyeMicroSaccadeX * 0.4;
          const irisY = eyeCenterY + gazeY * 2.5 + eyeMicroSaccadeY * 0.4;
          ctx.beginPath();
          ctx.arc(irisX, irisY, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = "#4a3525";
          ctx.fill();

          // Pupil (Black)
          ctx.beginPath();
          ctx.arc(irisX, irisY, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "#090a0d";
          ctx.fill();

          // Specular Catchlight
          ctx.beginPath();
          ctx.arc(irisX - 1.2, irisY - 1.2, 1, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
      });

      // 9. Defined Nose Bridge
      ctx.beginPath();
      ctx.moveTo(headX + gazeX * 4, headY - 7 + gazeY * 3);
      ctx.lineTo(headX - 1 + gazeX * 5, headY + 12 + gazeY * 4);
      ctx.lineTo(headX + 5 + gazeX * 5, headY + 14 + gazeY * 4);
      ctx.strokeStyle = "rgba(90, 48, 28, 0.45)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // 10. Multi-Phoneme Viseme Lip-Sync (Audio-Harmonic Synthesis)
      const mouthX = headX + gazeX * 3.5;
      const mouthY = headY + 30 + gazeY * 3;

      if (internalState === "speaking") {
        // Multi-frequency harmonic viseme synthesis
        const vFundamental = Math.sin(time * 9.5);
        const vMidHarmonic = Math.cos(time * 15.2);
        const vConsonant = Math.sin(time * 22.0) * 0.35;
        
        // jawOpen: primary vertical aperture (AA, O, UH)
        const jawOpen = Math.max(1.8, Math.min(10.5, (vFundamental * 0.5 + vMidHarmonic * 0.3 + 0.8) * 5.2));
        // mouthWidth: horizontal stretch (EE, S, T)
        const mouthWidth = Math.max(9, Math.min(16, 12.5 + vMidHarmonic * 2.8 + vConsonant * 1.5));
        const isPuckered = jawOpen < 4.0 && vMidHarmonic > 0.4;
        const currentMouthWidth = isPuckered ? mouthWidth * 0.75 : mouthWidth;

        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, currentMouthWidth, jawOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#451616";
        ctx.fill();
        ctx.strokeStyle = "#823232";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Upper Teeth Definition during wide/open vowels
        if (jawOpen > 3.0) {
          ctx.beginPath();
          ctx.rect(mouthX - currentMouthWidth * 0.55, mouthY - jawOpen + 1, currentMouthWidth * 1.1, Math.min(2.8, jawOpen * 0.4));
          ctx.fillStyle = "#f8fafc";
          ctx.fill();
        }
        // Lower Teeth definition during deep open vowels
        if (jawOpen > 6.5) {
          ctx.beginPath();
          ctx.rect(mouthX - currentMouthWidth * 0.45, mouthY + jawOpen - 2.5, currentMouthWidth * 0.9, 2);
          ctx.fillStyle = "#e2e8f0";
          ctx.fill();
        }
      } else if (internalState === "listening") {
        // Attentive receptive parting of lips
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - 2, 10.5, 0.1, Math.PI - 0.1);
        ctx.strokeStyle = "#7a3826";
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";
        ctx.stroke();
      } else {
        // Neutral executive composed smile
        ctx.beginPath();
        ctx.arc(mouthX, mouthY - 3, 11, 0.15, Math.PI - 0.15);
        ctx.strokeStyle = "#7a3826";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [internalState]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#202533] bg-gradient-to-b from-slate-900 via-[#0c0e14] to-[#07080b] shadow-xl flex flex-col items-center justify-between p-4 ${className}`}>
      {/* Top Header Pill */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-400">
            MV
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[11px] leading-tight">Marcus Vance</span>
            <span className="text-[9px] text-zinc-400 font-mono leading-tight">VP of Talent</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dynamic State Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md border transition-all ${
            internalState === "speaking"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse"
              : internalState === "listening"
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : internalState === "thinking"
              ? "bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse"
              : "bg-slate-800/60 text-zinc-400 border-white/5"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              internalState === "speaking" ? "bg-emerald-400 animate-ping" : internalState === "listening" ? "bg-blue-400" : internalState === "thinking" ? "bg-purple-400 animate-ping" : "bg-zinc-500"
            }`} />
            <span className="capitalize">{internalState === "thinking" ? "Evaluating..." : internalState}</span>
          </span>

          {/* Stop Speaking Button if currently speaking */}
          {internalState === "speaking" && onStopSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 backdrop-blur-md text-[10px] font-mono transition cursor-pointer border border-rose-500/30 flex items-center gap-1"
              title="Stop voice speech"
            >
              <VolumeX className="w-3 h-3" />
              <span>Silence</span>
            </button>
          )}

          {/* Mute / Unmute Button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 backdrop-blur-md text-zinc-400 hover:text-white transition cursor-pointer border border-white/10"
              title={isMuted ? "Unmute Marcus" : "Mute Marcus"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Mesh */}
      <div className="relative w-full aspect-square max-w-[280px] my-auto flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
        />
      </div>

      {/* Bottom Subtitle / Audio Wave Indicator */}
      <div className="w-full z-10 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5 font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bar Raiser Interview Mode</span>
        </div>
        {internalState === "speaking" && (
          <div className="flex items-center gap-0.5 h-3">
            {[0.4, 0.9, 0.5, 1, 0.6, 0.8, 0.3].map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-emerald-400 rounded-full animate-pulse"
                style={{ height: `${h * 12}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
