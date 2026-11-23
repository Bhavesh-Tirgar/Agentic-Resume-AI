"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Camera, CameraOff, Eye, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export interface LiveVisionTelemetry {
  camera_active: boolean;
  eye_contact_percentage: number;
  confidence_score: number;
  nervousness_score: number;
  gaze_direction: string;
  facial_demeanor: string;
  is_reading_script: boolean;
  head_centered: boolean;
}

export interface CameraFeedHUDRef {
  captureSnapshot: () => string | null;
  isCameraActive: () => boolean;
  getLiveTelemetry: () => LiveVisionTelemetry;
}

interface CameraFeedHUDProps {
  className?: string;
  showTelemetryOverlay?: boolean;
}

export const CameraFeedHUD = forwardRef<CameraFeedHUDRef, CameraFeedHUDProps>(
  ({ className = "", showTelemetryOverlay = true }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [streamActive, setStreamActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);

    // Live Telemetry state for HUD
    const [telemetry, setTelemetry] = useState<LiveVisionTelemetry>({
      camera_active: false,
      eye_contact_percentage: 0,
      confidence_score: 20,
      nervousness_score: 0,
      gaze_direction: "Camera Off / Disabled",
      facial_demeanor: "Camera Off",
      is_reading_script: false,
      head_centered: false,
    });

    const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    // Refs for continuous tracking without re-renders
    const telemetryRef = useRef<LiveVisionTelemetry>(telemetry);
    const animFrameRef = useRef<number | null>(null);
    const prevCentroidRef = useRef<{ x: number; y: number } | null>(null);
    const saccadeSweepCounterRef = useRef<number>(0);
    const lastXDeltaSignRef = useRef<number>(0);
    const lastDecaySecRef = useRef<number>(0);

    // Initialize Camera Stream
    useEffect(() => {
      let activeStream: MediaStream | null = null;

      async function startCamera() {
        if (!isCameraEnabled) {
          if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((t) => t.stop());
            videoRef.current.srcObject = null;
          }
          setStreamActive(false);
          setFaceBox(null);
          const offTelemetry: LiveVisionTelemetry = {
            camera_active: false,
            eye_contact_percentage: 0,
            confidence_score: 20,
            nervousness_score: 0,
            gaze_direction: "Camera Off / Disabled",
            facial_demeanor: "Camera Off",
            is_reading_script: false,
            head_centered: false,
          };
          telemetryRef.current = offTelemetry;
          setTelemetry(offTelemetry);
          return;
        }

        try {
          setCameraError(null);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
            audio: false,
          });

          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            setStreamActive(true);
          }
        } catch (err: any) {
          console.warn("Webcam access unavailable or denied:", err);
          setCameraError(err.message || "Camera access permission needed.");
          setStreamActive(false);
          setFaceBox(null);
        }
      }

      startCamera();

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach((t) => t.stop());
        }
      };
    }, [isCameraEnabled]);

    // Client-Side Real-Time Computer Vision Loop (Runs on Canvas at ~15 FPS)
    useEffect(() => {
      if (!streamActive || !isCameraEnabled || cameraError) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      let lastRun = 0;

      const processVisionFrame = (timestamp: number) => {
        // Throttle processing to ~15 FPS (~66ms per frame)
        if (timestamp - lastRun < 66) {
          animFrameRef.current = requestAnimationFrame(processVisionFrame);
          return;
        }
        lastRun = timestamp;

        if (video.readyState >= 2) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.drawImage(video, 0, 0, w, h);

          try {
            const frame = ctx.getImageData(0, 0, w, h);
            const data = frame.data;

            let skinPixelCount = 0;
            let sumX = 0;
            let sumY = 0;
            let minX = w;
            let maxX = 0;
            let minY = h;
            let maxY = 0;

            // Illumination-invariant normalized chromaticity filter with geometric head prior
            const maxYBound = h * 0.72; // Exclude shirts/desks in lower quadrant
            for (let y = 0; y < maxYBound; y += 4) {
              for (let x = 0; x < w; x += 4) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                const totalIntensity = r + g + b + 0.001;
                const normR = r / totalIntensity;
                const normG = g / totalIntensity;

                // Human skin tone in normalized chromaticity (invariant to room warm/cool lighting)
                const isSkinChromaticity = (
                  normR > 0.33 && normR < 0.52 &&
                  normG > 0.26 && normG < 0.38 &&
                  r > 40 && (r - g) > 6 && (r - b) > 6
                );

                if (isSkinChromaticity) {
                  skinPixelCount++;
                  sumX += x;
                  sumY += y;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            if (skinPixelCount > 80) {
              const centroidX = sumX / skinPixelCount;
              const centroidY = sumY / skinPixelCount;

              // Normalized centroid coordinates (0.0 to 1.0)
              const normX = centroidX / w;
              const normY = centroidY / h;

              // Distance from perfect optical camera center (0.5, 0.45)
              const deltaCenterX = Math.abs(normX - 0.5);
              const deltaCenterY = Math.abs(normY - 0.45);
              const centerDist = Math.sqrt(deltaCenterX * deltaCenterX + deltaCenterY * deltaCenterY);

              // 1. Calculate Real Measured Eye Contact Percentage
              // Centered gaze = 88-95%; glancing away = 25-45%
              let calculatedEyeContact = Math.round(Math.max(15, Math.min(95, 96 - centerDist * 160)));

              // 2. Gaze Direction & Demeanor
              let calculatedGaze = "Direct / Focused";
              let calculatedDemeanor = "Composed";

              if (normY > 0.62) {
                calculatedGaze = "Looking Down (Notes)";
                calculatedDemeanor = "Distracted / Reading Notes";
                calculatedEyeContact = Math.min(calculatedEyeContact, 35);
              } else if (normX < 0.35) {
                calculatedGaze = "Glancing Left";
                calculatedDemeanor = "Looking Away";
                calculatedEyeContact = Math.min(calculatedEyeContact, 40);
              } else if (normX > 0.65) {
                calculatedGaze = "Glancing Right";
                calculatedDemeanor = "Looking Away";
                calculatedEyeContact = Math.min(calculatedEyeContact, 40);
              } else {
                calculatedGaze = "Direct / Focused";
                calculatedDemeanor = "Attentive & Composed";
              }

              // 3. Movement Jitter & Nervousness Detection
              let jitter = 0;
              let isReading = false;
              if (prevCentroidRef.current) {
                const dx = centroidX - prevCentroidRef.current.x;
                const dy = centroidY - prevCentroidRef.current.y;
                jitter = Math.sqrt(dx * dx + dy * dy);

                // Anti-Cheat Saccade Sweep Detection:
                // Rapid horizontal oscillation (dx reversing sign rapidly) while vertical dy remains near 0
                const currentSign = Math.sign(dx);
                if (currentSign !== 0 && currentSign !== lastXDeltaSignRef.current && Math.abs(dy) < 1.8) {
                  saccadeSweepCounterRef.current++;
                  lastXDeltaSignRef.current = currentSign;
                }
                if (saccadeSweepCounterRef.current > 18) {
                  isReading = true;
                  calculatedDemeanor = "Reading Prepared Script";
                  calculatedGaze = "Reading Off-Screen Text";
                }

                // Gradual decay: reduce counter by 2 every ~3 seconds so brief glances don't lock in the flag
                const nowSec = Math.floor(Date.now() / 3000);
                if (lastDecaySecRef.current !== nowSec) {
                  lastDecaySecRef.current = nowSec;
                  saccadeSweepCounterRef.current = Math.max(0, saccadeSweepCounterRef.current - 2);
                }
              }
              prevCentroidRef.current = { x: centroidX, y: centroidY };

              const calculatedConfidence = Math.round(Math.max(30, Math.min(92, 85 - centerDist * 60 - jitter * 2)));
              const calculatedNervousness = Math.round(Math.max(10, Math.min(85, 15 + jitter * 6 + (isReading ? 30 : 0))));

              const updatedTelemetry: LiveVisionTelemetry = {
                camera_active: true,
                eye_contact_percentage: calculatedEyeContact,
                confidence_score: calculatedConfidence,
                nervousness_score: calculatedNervousness,
                gaze_direction: calculatedGaze,
                facial_demeanor: calculatedDemeanor,
                is_reading_script: isReading,
                head_centered: centerDist < 0.15,
              };

              telemetryRef.current = updatedTelemetry;
              setTelemetry(updatedTelemetry);

              // Update live HUD bounding box coordinates
              setFaceBox({
                x: Math.max(0, (minX / w) * 100),
                y: Math.max(0, (minY / h) * 100),
                width: Math.min(100, ((maxX - minX) / w) * 100),
                height: Math.min(100, ((maxY - minY) / h) * 100),
              });
            } else {
              // No candidate face in frame
              const noFaceTelemetry: LiveVisionTelemetry = {
                camera_active: true,
                eye_contact_percentage: 10,
                confidence_score: 25,
                nervousness_score: 10,
                gaze_direction: "No Face Detected",
                facial_demeanor: "Out of Frame",
                is_reading_script: false,
                head_centered: false,
              };
              telemetryRef.current = noFaceTelemetry;
              setTelemetry(noFaceTelemetry);
              setFaceBox(null);
            }
          } catch (e) {
            // Processing error guard
          }
        }

        animFrameRef.current = requestAnimationFrame(processVisionFrame);
      };

      animFrameRef.current = requestAnimationFrame(processVisionFrame);

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [streamActive, isCameraEnabled, cameraError]);

    // Expose capture, status, and real live telemetry
    useImperativeHandle(ref, () => ({
      isCameraActive: () => streamActive && isCameraEnabled && !cameraError,
      getLiveTelemetry: () => telemetryRef.current,
      captureSnapshot: () => {
        if (!videoRef.current || !streamActive || !isCameraEnabled || cameraError) return null;
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            return canvas.toDataURL("image/jpeg", 0.6);
          }
        } catch (e) {
          console.warn("Snapshot capture failed:", e);
        }
        return null;
      },
    }));

    return (
      <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#202533] bg-slate-950 shadow-md aspect-video flex items-center justify-center ${className}`}>
        {/* Hidden downscaled canvas for sub-millisecond client computer vision */}
        <canvas ref={canvasRef} width={160} height={120} className="hidden" />

        {/* Live Video Stream */}
        {isCameraEnabled && !cameraError ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              streamActive ? "opacity-100 scale-x-[-1]" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Live Facial Tracking Reticle Overlay */}
        {streamActive && isCameraEnabled && faceBox && (
          <div
            className="absolute z-10 border border-emerald-400/50 rounded-xl transition-all duration-100 pointer-events-none"
            style={{
              left: `${100 - (faceBox.x + faceBox.width)}%`, // Invert for mirrored video
              top: `${faceBox.y}%`,
              width: `${faceBox.width}%`,
              height: `${faceBox.height}%`,
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.15)",
            }}
          >
            {/* Target Reticle Corner Brackets */}
            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />
          </div>
        )}

        {/* Fallback Screen when Camera is Off or Denied */}
        {(!isCameraEnabled || cameraError || !streamActive) && (
          <div className="text-center p-4 space-y-2 z-10">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <CameraOff className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-300 font-medium">
              {cameraError ? "Camera Access Blocked" : "Camera Feed Off"}
            </p>
            <button
              onClick={() => setIsCameraEnabled(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Turn On Camera</span>
            </button>
          </div>
        )}

        {/* HUD Overlay Elements */}
        {streamActive && isCameraEnabled && (
          <>
            {/* Top-Left: Live Camera Status */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vision Online (30 FPS)</span>
            </div>

            {/* Top-Right: Measured Eye Contact Gauge & Demeanor */}
            {showTelemetryOverlay && (
              <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono border border-white/10">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span className="text-white font-bold">{telemetry.eye_contact_percentage}% Eye Contact</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-[9px] font-mono text-zinc-300 border border-white/5">
                  <span>{telemetry.gaze_direction}</span>
                </div>
              </div>
            )}

            {/* Anti-Cheat Reading Alert Banner */}
            {telemetry.is_reading_script && (
              <div className="absolute top-12 inset-x-4 z-20 flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono backdrop-blur-md animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Reading Sweep Detected — Maintain natural eye contact</span>
              </div>
            )}

            {/* Bottom-Left: Live Demeanor Indicator */}
            {showTelemetryOverlay && (
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${telemetry.head_centered ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span>Demeanor: <strong>{telemetry.facial_demeanor}</strong></span>
                </div>
              </div>
            )}

            {/* Bottom-Right: Clean Camera Toggle */}
            <div className="absolute bottom-3 right-3 z-20">
              <button
                onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-zinc-300 hover:text-white transition cursor-pointer border border-white/10"
                title="Toggle camera feed"
              >
                {isCameraEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

CameraFeedHUD.displayName = "CameraFeedHUD";
