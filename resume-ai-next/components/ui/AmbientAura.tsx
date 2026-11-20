"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AmbientAuraProps {
  variant?: "hero" | "emerald" | "violet" | "subtle";
  className?: string;
}

export function AmbientAura({ variant = "hero", className = "" }: AmbientAuraProps) {
  const shouldReduceMotion = useReducedMotion();

  if (variant === "hero") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
        {/* Emerald Aura */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.22, 0.35, 0.22],
                  x: [0, 30, 0],
                  y: [0, -25, 0],
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 left-1/4 -translate-x-1/2 w-[550px] h-[400px] bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-transparent rounded-full blur-[130px]"
        />

        {/* Electric Violet Aura */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.15, 1],
                  opacity: [0.18, 0.3, 0.18],
                  x: [0, -40, 0],
                  y: [0, 30, 0],
                }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 right-1/4 translate-x-1/2 w-[600px] h-[420px] bg-gradient-to-bl from-violet-600/25 via-indigo-500/15 to-transparent rounded-full blur-[130px]"
        />
      </div>
    );
  }

  if (variant === "emerald") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/15 rounded-full blur-[130px]" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-violet-600/15 rounded-full blur-[130px]" />
    </div>
  );
}
