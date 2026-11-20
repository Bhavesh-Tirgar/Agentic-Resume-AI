"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "../ThemeProvider";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export function SpotlightCard({
  children,
  spotlightColor,
  className = "",
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const { theme } = useTheme();

  const isLight = theme === "light";
  const effectiveSpotlight =
    spotlightColor ||
    (isLight ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.04)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative rounded-xl border transition-colors",
        "dark:border-[#20242e] dark:bg-[#111318] dark:text-zinc-100 dark:hover:border-[#2d3342]",
        "border-slate-200 bg-white text-slate-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:border-slate-300",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-xl"
        style={{
          opacity,
          background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, ${effectiveSpotlight}, transparent 45%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
