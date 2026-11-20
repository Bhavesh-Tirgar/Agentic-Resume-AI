"use client";

import React from "react";

interface AmbientAuraProps {
  variant?: "hero" | "subtle";
  className?: string;
}

export function AmbientAura({ variant = "hero", className = "" }: AmbientAuraProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
      <div className="hidden dark:block absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-[140px]" />
    </div>
  );
}
