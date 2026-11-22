"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Camera, CameraOff } from "lucide-react";

export interface CameraFeedHUDRef {
  captureSnapshot: () => string | null;
  isCameraActive: () => boolean;
}

interface CameraFeedHUDProps {
  className?: string;
}

export const CameraFeedHUD = forwardRef<CameraFeedHUDRef, CameraFeedHUDProps>(
  ({ className = "" }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamActive, setStreamActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);

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
        }
      }

      startCamera();

      return () => {
        if (activeStream) {
          activeStream.getTracks().forEach((t) => t.stop());
        }
      };
    }, [isCameraEnabled]);

    // Expose capture and status methods
    useImperativeHandle(ref, () => ({
      isCameraActive: () => streamActive && isCameraEnabled && !cameraError,
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
      <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#202533] bg-slate-900 shadow-sm aspect-video flex items-center justify-center ${className}`}>
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

        {/* Fallback Screen when Camera is Off or Denied */}
        {(!isCameraEnabled || cameraError || !streamActive) && (
          <div className="text-center p-4 space-y-2 z-10">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <CameraOff className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-300 font-medium">
              {cameraError ? "Camera Off (Optional)" : "Camera Paused"}
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

        {/* Clean, Non-Intrusive Controls */}
        {streamActive && isCameraEnabled && (
          <>
            {/* Top-Left: Minimal Online Pill */}
            <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-medium text-white border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Your Video</span>
            </div>

            {/* Bottom-Right: Clean Camera Toggle */}
            <div className="absolute bottom-2.5 right-2.5 z-20">
              <button
                onClick={() => setIsCameraEnabled(!isCameraEnabled)}
                className="p-1.5 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur-md text-zinc-300 hover:text-white transition cursor-pointer border border-white/10"
                title="Toggle camera"
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
